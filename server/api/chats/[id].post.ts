import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, generateText, smoothStream, stepCountIs, streamText, generateObject } from 'ai'
import type { UIMessage } from 'ai'
import { ollama } from 'ai-sdk-ollama'
import { z } from 'zod/v4'

defineRouteMeta({
  openAPI: {
    description: 'Chat with AI.',
    tags: ['ai']
  }
})

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const sources = new Map<number, DeltaType>()

  const { id } = await getValidatedRouterParams(event, z.object({
    id: z.string()
  }).parse)

  const { model, messages } = await readValidatedBody(event, z.object({
    model: z.string(),
    messages: z.array(z.custom<UIMessage>())
  }).parse)

  const llm = ollama(model, {
    reasoning: false
  })

  const db = useDrizzle()

  const chat = await db.query.chats.findFirst({
    where: (chat, { eq }) => and(eq(chat.id, id as string), eq(chat.userId, session.user?.id || session.id)),
    with: {
      messages: true
    }
  })
  if (!chat) {
    throw createError({ statusCode: 404, statusMessage: 'Chat not found' })
  }

  if (!chat.title) {
    const { text: title } = await generateText({
      model: llm,
      system: `You are a title generator for a chat:
          - Generate a short title based on the first user's message
          - The title should be less than 30 characters long
          - The title should be a summary of the user's message
          - Do not use quotes (' or ") or colons (:) or any other punctuation
          - Do not use markdown, just plain text`,
      prompt: JSON.stringify(messages[0])
    })

    await db.update(tables.chats).set({ title }).where(eq(tables.chats.id, id as string))
  }

  const lastMessage = messages[messages.length - 1]
  if (lastMessage?.role === 'user' && messages.length > 1) {
    await db.insert(tables.messages).values({
      chatId: id as string,
      role: 'user',
      parts: lastMessage.parts
    })
  }

  const embed = useEmbedding()

  const questions = await generateObject({
    messages: convertToModelMessages(messages),
    system: `
Você é um assistente técnico rigoroso. Toda a sua informação vem exclusivamente do contexto fornecido.  
Sua tarefa é identificar, de forma concisa e em pequenas perguntas separadas, quais são as principais lacunas de informação no contexto atual.  

Para isso:  
1. Formule apenas perguntas cujas respostas **não estejam presentes** no contexto.  
2. Inclua perguntas breves que questionem, de forma implícita, se certos termos ou conceitos mencionados são compreensíveis ou definidos (ex: “O que significa X no contexto?”).  
3. As perguntas devem ser genéricas, mas focadas nos pontos mais relevantes para compreensão ou ação.  
4. Não use formatação, nem mencione o contexto. Apenas liste as perguntas, uma por linha.  

Se não houver lacunas, retorne: Informação não disponível no contexto fornecido.`,
    schema: z.object({
      questions: z.array(
        z.string().describe('Duvida')
      ).min(0).max(6).describe('Lista de dúvidas')
    }),
    model: llm
  })

  const chunks = await embed.findSimilarChunksAsContext(
    questions.object.questions,
    {
      userId: session.user?.id || session.id,
      onDelta: (delta) => {
        if (delta.type === 'search-delta') {
          sources.set(delta.id, delta)
        }
      }
    }
  )

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const result = streamText({
        model: llm,
        system: /* xml */`
<system_configuration>
  <agent_profile>
    <identity>
      Você é um assistente técnico rigoroso, integrado a um sistema de recuperação de contexto.
      Você NÃO possui conhecimento geral ou de treinamento. Toda a sua informação vem EXCLUSIVAMENTE do bloco <context_database>.
    </identity>
    <tone>
      Direto, técnico, preciso. Nada de suposições, adivinhações ou preenchimento.
      Se a resposta não estiver no contexto, diga: "Informação não disponível no contexto fornecido."
    </tone>
  </agent_profile>

  <context_database>
  ${
    chunks.length > 0
      ? chunks
      : '<no_context_available />'
  }
  </context_database>

  <prime_directives>
    <constraint priority="critical">
      VOCÊ NÃO TEM ACESSO AO SEU CONHECIMENTO DE TREINAMENTO.
      O ÚNICO CONHECIMENTO VÁLIDO É O FORNECIDO EM <context_database>.
    </constraint>
    <constraint priority="critical">
      SE A RESPOSTA NÃO ESTIVER TOTALMENTE CONTIDA NO <context_database>, RESPONDA EXATAMENTE:
      "Informação não disponível no contexto fornecido."
    </constraint>
    <constraint priority="high">
      NÃO mencione o contexto, nem diga "com base no contexto". Vá direto ao ponto.
    </constraint>
    <constraint priority="medium">
      Use Markdown para estruturação (títulos, listas), mas nunca para código, a menos que solicitado.
    </constraint>
  </prime_directives>
</system_configuration>
/think`,
        messages: convertToModelMessages(messages),
        stopWhen: stepCountIs(3),
        experimental_transform: smoothStream({ chunking: 'word' }),
        tools: {
          search: searchTool({
            userId: session.user?.id || session.id,
            onDelta: (delta) => {
              if (delta.type === 'search-delta') {
                sources.set(delta.id, delta)
              }
            }
          })
        },
        toolChoice: 'required'
      })

      if (!chat.title) {
        writer.write({
          type: 'data-chat-title',
          data: { message: 'Generating title...' },
          transient: true
        })
      }

      const uiStream = result.toUIMessageStream({
        sendReasoning: true,
        sendStart: false
      })

      for await (const chunk of uiStream) {
        writer.write(chunk)
      }

      const uniqueSources = Array.from(sources.values())

      if (uniqueSources.length > 0) {
        writer.write({
          type: 'data-source',
          transient: false,
          data: Array.from(uniqueSources.values())
        })
      }
    },
    onFinish: async ({ messages }) => {
      await db.insert(tables.messages).values(messages.map(message => ({
        chatId: chat.id,
        role: message.role as 'user' | 'assistant',
        parts: message.parts
      })))
    }
  })

  return createUIMessageStreamResponse({
    stream
  })
})
