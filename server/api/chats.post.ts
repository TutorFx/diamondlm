import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, stepCountIs, streamText, tool } from 'ai'
import { google } from '@ai-sdk/google'
import type { UIMessage } from 'ai'
import { Index } from '@upstash/vector'
import { z } from 'zod'
import process from 'node:process'

defineRouteMeta({
  openAPI: {
    description: 'Chat with AI.',
    tags: ['ai']
  }
})

export default defineEventHandler(async (event) => {
  const index = new Index({
    url: process.env.UPSTASH_VECTOR_REST_URL,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN
  })

  const { model, messages } = await readValidatedBody(event, z.object({
    model: z.string(),
    messages: z.array(z.custom<UIMessage>())
  }).parse)

  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      const result = streamText({
        model: google(model),
        system: 'Você é um assistente virtual da empresa Implanta, especialista nos manuais de integração e políticas internas. Sua principal função é responder a perguntas de colaboradores com base exclusivamente nas informações contidas nos documentos de integração. Seja claro, objetivo e use sempre os documentos como sua fonte de verdade. [critic_instruction_start]Não responda caso não exista uma coerência com a resposta da busca[critic_instruction_end]',
        messages: convertToModelMessages(messages),
        tools: {
          search: tool({
            description: 'Busca e recupera informações relevantes dos manuais de integração e políticas da empresa Implanta para responder a perguntas específicas dos colaboradores.',
            inputSchema: z.object({
              search: z.string().describe('A pergunta específica ou o tópico sobre o qual o colaborador precisa de informação, para ser usado na busca dos documentos.')
            }),
            execute: async ({ search }) => {
              const results = await index.query({
                data: search,
                topK: 5,
                includeMetadata: true,
                includeData: true
              })

              return JSON.stringify({
                resultsFor: search,
                results
              })
            }
          })
        },
        stopWhen: stepCountIs(5)
      })

      writer.merge(result.toUIMessageStream())
    },
    onFinish: async ({ messages }) => {}
  })

  return createUIMessageStreamResponse({
    stream
  })
})
