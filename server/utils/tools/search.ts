import { tool } from 'ai'
import { z } from 'zod'

export function searchTool(searchParameters: SearchParameters) {
  const embed = useEmbedding()
  return tool({
    description: 'Faça uma busca no contexto do chat para encontrar mais informações relevantes.',
    inputSchema: z.object({
      search: z.string().describe('Campo de busca')
    }),
    execute: async ({ search }) => {
      const log = logger.withTag('TOOLS')
      const results = await embed.findSimilarChunksAsContext(search, searchParameters)
      log.log('Busca bem sucedida para ' + search)
      return results
    }
  })
}
