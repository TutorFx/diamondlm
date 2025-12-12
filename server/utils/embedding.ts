import { l2Distance, and, eq, sql, desc, or, isNull, gt } from 'drizzle-orm'
import { chunk, guides, groupMembers } from '../database/schema'
import { PERMISSIONS } from '../../shared/utils/permissions'
import { embed, embedMany } from 'ai'
import { useOllama } from './ollama'

export function useEmbedding() {
  const ollama = useOllama()
  const db = useDrizzle()

  const generateEmbedding = async (description: string) => {
    const model = ollama.textEmbeddingModel('bge-m3')
    const result = await embed({ value: description, model })
    return result.embedding
  }

  const generateManyEmbeddings = async (values: string[]) => {
    const model = ollama.textEmbeddingModel('bge-m3')

    const { embeddings } = await embedMany({
      model: model,
      values: values
    })

    return embeddings
  }

  const findSimilarChunks = async (search: string, searchParameters?: SearchParameters) => {
    logger.info(`Gerando embedding a busca: "${search}"`)
    const embedding = await generateEmbedding(search)
    const similarity = sql<number>`1 - (${l2Distance(chunk.embedding, embedding)})`
    const similarGuides = await db
      .select({
        similarity,
        guide: {
          title: guides.title
        },
        chunk: {
          content: chunk.content,
          id: chunk.id
        }
      })
      .from(chunk)
      .innerJoin(guides, eq(chunk.guideId, guides.id))
      .leftJoin(groupMembers, and(
        eq(groupMembers.groupId, guides.groupId),
        searchParameters?.userId ? eq(groupMembers.userId, searchParameters.userId) : sql`FALSE`
      ))
      .where(and(
        gt(similarity, -0.5),
        or(
          isNull(guides.groupId),
          sql`${groupMembers.permissions} @> jsonb_build_array(${PERMISSIONS.GUIDE.READ}::text)`
        )
      ))
      .orderBy(t => desc(t.similarity))
      .limit(2)

    if (typeof searchParameters?.onDelta === 'function') {
      await searchParameters.onDelta({
        type: 'start-search',
        search
      })
      for (let i = 0; i < similarGuides.length; i++) {
        const delta = similarGuides[i]
        if (!delta) continue

        await searchParameters.onDelta({
          text: delta.chunk.content,
          id: delta.chunk.id,
          source: delta.guide.title,
          type: 'search-delta'
        })
      }
      await searchParameters.onDelta({
        type: 'end-search'
      })
    }

    return similarGuides
  }

  const findSimilarChunksAsContext = async (search: string | string[], searchParameters?: SearchParameters) => {
    let searchList: string[]

    if (typeof search === 'string') {
      searchList = [search]
    } else if (Array.isArray(search)) {
      searchList = search
    } else {
      throw createError('Invalid search input')
    }

    const uniqueMap = new Map(
      (
        await Promise.all(searchList.map(query => findSimilarChunks(query, searchParameters)))
      )
        .flat()
        .sort((a, b) => a.chunk.id > b.chunk.id ? 1 : -1)
        .map(obj => [obj.chunk.id, obj])
    )

    const results = Array.from(uniqueMap.values())

    if (results.length === 0) return '<context_database><no_context_available /></context_database>'

    return results.flat().map(result => `
    <context_database search="${JSON.stringify(search)}">
      <document id="${result.chunk.id}" relevance="${result.similarity.toFixed(2)}" source="${result.guide.title}">
          ${result.chunk.content}
      </document>
    </context_database>`).join('\n')
  }

  return { findSimilarChunks, findSimilarChunksAsContext, generateEmbedding, generateManyEmbeddings }
}
