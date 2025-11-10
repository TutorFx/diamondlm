import { tool } from 'ai'
import { z } from 'zod'

type DeltaCallback = (delta: string) => void | Promise<void>

interface SearchParameters {
  onDelta?: DeltaCallback
}

export function searchTool(searchParameters?: SearchParameters) {
  const embed = useEmbedding()
  return tool({
    description: 'Busca e recupera informações relevantes dos manuais de integração e políticas da empresa Implanta para responder a perguntas específicas dos colaboradores.',
    inputSchema: z.object({
      search: z.string().describe('A pergunta específica ou o tópico sobre o qual o colaborador precisa de informação, para ser usado na busca dos documentos.')
    }),
    execute: async ({ search }) => {
      const results = await embed.findSimilarGuides(search)

      console.log(results)

      if (typeof searchParameters?.onDelta === 'function') {
        for (let i = 0; i < results.length; i++) {
          const delta = results[i]

          await searchParameters.onDelta(delta.description)
        }
      }

      return JSON.stringify({
        resultsFor: search,
        results
      })
    }
  })
}
