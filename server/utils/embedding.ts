import { cosineDistance } from 'drizzle-orm'
import { chunk, guides } from '../database/schema'
import { encode } from '@toon-format/toon'
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

  const findSimilarGuides = async (description: string) => {
    console.log('Gerando embedding para a descrição fornecida...')
    const embedding = await generateEmbedding(description)
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
      // .where(gt(similarity, 0.5))
      .orderBy(t => desc(t.similarity))
      .limit(4)
    return encode(similarGuides)
  }

  return { findSimilarGuides, generateEmbedding, generateManyEmbeddings }
}
