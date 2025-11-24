import { cosineDistance, and, eq, sql, desc, or, isNull, gt } from 'drizzle-orm'
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

  const findSimilarGuides = async (search: string, userId: string | null) => {
    console.log('Gerando embedding para a descrição fornecida...')
    const embedding = await generateEmbedding(search)
    const similarity = sql<number>`1 - (${cosineDistance(chunk.embedding, embedding)})`
    const similarGuides = await db
      .select({
        similarity,
        guide: {
          title: guides.title
        },
        chunk: {
          content: chunk.content
        }
      })
      .from(chunk)
      .innerJoin(guides, eq(chunk.guideId, guides.id))
      .leftJoin(groupMembers, and(
        eq(groupMembers.groupId, guides.groupId),
        userId ? eq(groupMembers.userId, userId) : sql`FALSE`
      ))
      .where(and(
        gt(similarity, 0.3),
        or(
          isNull(guides.groupId),
          sql`${groupMembers.permissions} @> jsonb_build_array(${PERMISSIONS.GUIDE.READ}::text)`
        )
      ))
      .orderBy(t => desc(t.similarity))
      .limit(4)
    return similarGuides
  }

  return { findSimilarGuides, generateEmbedding, generateManyEmbeddings }
}
