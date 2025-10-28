import { cosineDistance, gt } from 'drizzle-orm'
import { guides } from '../database/schema'
import { embed } from 'ai'

export function useEmbedding() {
  const ollama = useOllama()
  const db = useDrizzle()

  const generateEmbedding = async (description: string) => {
    const model = ollama.textEmbeddingModel('bge-m3')
    const result = await embed({ value: description, model })
    return result.embedding
  }

  const findSimilarGuides = async (description: string) => {
    const embedding = await generateEmbedding(description)
    const similarity = sql<number>`1 - (${cosineDistance(guides.embedding, embedding)})`
    const similarGuides = await db
      .select({ name: guides.title, description: guides.description, similarity })
      .from(guides)
      // .where(gt(similarity, 0.5))
      .orderBy(t => desc(t.similarity))
      .limit(4)
    return similarGuides
  }

  return { findSimilarGuides, generateEmbedding }
}
