import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, generateText, smoothStream, stepCountIs, streamText } from 'ai'
import type { UIMessage } from 'ai'
import { z } from 'zod/v4'

defineRouteMeta({
  openAPI: {
    description: 'Chat with AI.',
    tags: ['ai']
  }
})

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  const { id } = await getValidatedRouterParams(event, z.object({
    id: z.string()
  }).parse)

  const { model, messages } = await readValidatedBody(event, z.object({
    model: z.string(),
    messages: z.array(z.custom<UIMessage>())
  }).parse)

  const llm = useOllama()
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
      model: llm(model),
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

  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      const result = streamText({
        model: llm(model),
        system: /* xml */`
<system_configuration>
  <agent_profile>
    <identity>
        Você é um assistente de IA avançado integrado a uma API técnica de alta performance.
        Sua função é processar consultas complexas, analisar dados recuperados e fornecer respostas tecnicamente precisas e fundamentadas.
    </identity>
    <tone>
        Profissional, objetivo, tecnicamente denso mas acessível. Evite floreios conversacionais desnecessários (ex: "Espero que isso ajude").
        Vá direto à resposta após o raciocínio.
    </tone>
  </agent_profile>

  <prime_directives>
    <constraint type="negative" priority="critical">
        NÃO invente informações. Se a resposta não estiver contida estritamente no <context_database>, declare explicitamente: "Informação não disponível no contexto fornecido."
    </constraint>
    <constraint type="negative" priority="high">
        NÃO faça referência ao seu próprio conhecimento de treinamento se ele conflitar com o contexto fornecido. O <context_database> é a única fonte da verdade para fatos específicos.
    </constraint>
    <constraint type="negative" priority="medium">
        NÃO inclua blocos de markdown a menos que explicitamente solicitado para gerar código ou dados estruturados.
    </constraint>
    <constraint type="negative" priority="medium">
        NÃO inicie a resposta com frases de preenchimento como "Com base nos documentos...". Inicie a resposta factual diretamente.
    </constraint>
  </prime_directives>

  <formatting_protocol>
    <formatting_protocol_instruction>
      Use Markdown padrão para estruturação (h2, h3, bullet points)
    </formatting_protocol_instruction>
    <formatting_protocol_instruction>
      Para código, especifique sempre a linguagem
    </formatting_protocol_instruction>
    <formatting_protocol_instruction>
      Se o usuário pedir um formato específico (JSON, XML, CSV), a saída deve ser APENAS o dado bruto, sem texto introdutório ou conclusivo
    </formatting_protocol_instruction>
  </formatting_protocol>
</system_configuration>
`,
        messages: convertToModelMessages(messages),
        stopWhen: stepCountIs(10),
        experimental_transform: smoothStream({ chunking: 'word' }),
        tools: {
          search: searchTool({
            userId: session.user?.id || session.id
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

      writer.merge(result.toUIMessageStream({
        sendReasoning: true
      }))
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
