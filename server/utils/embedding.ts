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

    // 1. Extração de Números da Pergunta
    // A regex abaixo pega sequências de dígitos.
    // O filtro length >= 3 evita dar boost em números irrelevantes como "1" ou "2" de listas.
    const numbersInQuery = (search.match(/\d+/g) || []).filter(n => n.length >= 3)

    const embedding = await generateEmbedding(search)

    // 2. Construção do Score Híbrido
    // Base: Similaridade Vetorial
    let similarityScore = sql`1 - (${l2Distance(chunk.embedding, embedding)})`

    // Boost: Se houver números, adicionamos pontuação extra
    if (numbersInQuery.length > 0) {
    // Definimos um peso alto (ex: 1.0) para garantir que o número exato suba para o topo
      const numberBoostWeight = 1.0

      const boostConditions = numbersInQuery.map((num) => {
      // Verifica se o número existe no conteúdo do chunk
        return sql`CASE WHEN ${chunk.content} ILIKE ${`%${num}%`} THEN ${numberBoostWeight} ELSE 0 END`
      })

      // Soma os boosts ao score original
      // Ex: score = (vector_score) + (boost_num_1) + (boost_num_2)
      similarityScore = sql`(${similarityScore}) + ${sql.join(boostConditions, sql` + `)}`
    }

    // 3. Execução da Query
    const similarGuides = await db
      .select({
      // Retornamos o score combinado para debug ou ordenação
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
      // Atenção: Como somamos 1.0 ao score, o filtro original (-0.5) continua válido,
      // mas chunks com o número exato terão score > 1.0, passando com certeza.
        gt(similarityScore, -0.5),
        or(
          isNull(guides.groupId),
          sql`${groupMembers.permissions} @> jsonb_build_array(${PERMISSIONS.GUIDE.READ}::text)`
        )
      ))
    // Ordena pelo score híbrido (o chunk com o número 6119 vai para o topo)
      .orderBy(desc(similarityScore))
      .limit(4) // Aumentei um pouco o limit para garantir que pegue o contexto certo se houver competição

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
