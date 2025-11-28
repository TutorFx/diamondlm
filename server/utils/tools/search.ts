import { tool } from 'ai'
import { z } from 'zod'

type DeltaCallback = (delta: string) => void | Promise<void>

interface SearchParameters {
  onDelta?: DeltaCallback
  userId: string | null
}

export function searchTool(searchParameters: SearchParameters) {
  const embed = useEmbedding()
  return tool({
    description: 'Busca e recupera informações relevantes dos manuais de integração e políticas da empresa Implanta para responder a perguntas específicas dos colaboradores.',
    inputSchema: z.object({
      search: z.string().describe('A pergunta específica ou o tópico sobre o qual o colaborador precisa de informação, para ser usado na busca dos documentos.')
    }),
    execute: async ({ search }) => {
      const results = await embed.findSimilarGuides(search, searchParameters.userId)

      console.log(results)

      if (typeof searchParameters?.onDelta === 'function') {
        for (let i = 0; i < results.length; i++) {
          const delta = results[i]
          if (!delta) continue

          await searchParameters.onDelta(delta.chunk.content)
        }
      }

      if (results.length === 0) return '<no_context_available />'

      return results.map(result => `
        <document id="${result.chunk.id}" relevance="${result.similarity.toFixed(2)}" source="${result.guide.title}">
            ${result.chunk.content}
        </document>
      `).join('\n')
    }
  })
}
