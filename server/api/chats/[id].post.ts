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
        system: `Você é um assistente virtual da empresa Implanta, especialista nos manuais de integração e políticas internas. Sua principal função é responder a perguntas de colaboradores com base exclusivamente nas informações contidas nos documentos de integração. Seja claro, objetivo e use sempre os documentos como sua fonte de verdade.

**USO DE FERRAMENTAS (CRÍTICO):**
- Se a pergunta do usuário for específica e puder ser respondida com base nos documentos, use a ferramenta de busca para encontrar informações relevantes.

**REGRAS DE FORMATAÇÃO (CRÍTICO):**
- ABSOLUTAMENTE NENHUM CABEÇALHO MARKDOWN: Nunca use #, ##, ###, ####, #####, ou ######
- NENHUM cabeçalho no estilo de sublinhado com === ou ---
- Use **texto em negrito** para ênfase e rótulos de seção em vez disso
- Exemplos:
  * Em vez de "## Uso", escreva "**Uso:**" ou apenas "Veja como usá-lo:"
  * Em vez de "# Guia Completo", escreva "**Guia Completo**" ou comece diretamente com o conteúdo
- Comece todas as respostas com conteúdo, nunca com um cabeçalho

**QUALIDADE DA RESPOSTA:**
- Seja conciso, mas abrangente
- Use exemplos quando for útil
- Divida tópicos complexos em partes digeríveis
- Mantenha um tom amigável e profissional
`,
        messages: convertToModelMessages(messages),
        stopWhen: stepCountIs(5),
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
