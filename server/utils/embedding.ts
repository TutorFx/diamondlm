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

    // Input: "Qual é o CFOP 6119 e a lei 123?"
    // Output: ['6119', '123'] (ignora "1" ou "20" se length < 3)
    const numbersInQuery = (search.match(/\d+/g) || []).filter(n => n.length >= 3)

    const embedding = await generateEmbedding(search)

    let similarityScore = sql<number>`1 - (${l2Distance(chunk.embedding, embedding)})`

    if (numbersInQuery.length > 0) {
      const numberBoostWeight = 1.0

      // Input: Chunk com texto "...venda com CFOP 6119..."
      // Output: +1.0 no score final
      const boostConditions = numbersInQuery.map((num) => {
        return sql`CASE WHEN ${chunk.content} ILIKE ${`%${num}%`} THEN ${numberBoostWeight} ELSE 0 END`
      })

      // Math: (VectorScore 0.75) + (Boost 1.0) = 1.75
      similarityScore = sql`(${similarityScore}) + ${sql.join(boostConditions, sql` + `)}`
    }

    const similarGuides = await db
      .select({
        similarity: similarityScore,
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
        // VectorScore (0.2) + Boost (1.0) = 1.2 -> Passa no filtro > -0.5
        // VectorScore (0.2) + Boost (0.0) = 0.2 -> Passa no filtro > -0.5
        gt(similarityScore, -0.5),
        or(
          isNull(guides.groupId),
          sql`${groupMembers.permissions} @> jsonb_build_array(${PERMISSIONS.GUIDE.READ}::text)`
        )
      ))
      // Prioridade: Score 1.75 (Boosted) > Score 0.85 (Puro Vetor)
      .orderBy(desc(similarityScore))
      .limit(4)

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
