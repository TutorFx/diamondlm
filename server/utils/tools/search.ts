import { tool } from 'ai'
import { z } from 'zod'

export function searchTool(searchParameters: SearchParameters) {
  const embed = useEmbedding()
  return tool({
    description: 'Faça uma busca no contexto do chat para encontrar informações relevantes.',
    inputSchema: z.object({
      search: z.string().describe('Campo de busca')
    }),
    execute: async ({ search }) => {
      const results = await embed.findSimilarChunksAsContext(search, searchParameters)
      console.log(results)
      return results
    }
  })
}
