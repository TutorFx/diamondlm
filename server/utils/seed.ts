import { CharacterTextSplitter } from '@langchain/textsplitters'
import { useOllama } from './ollama'
import { useDrizzle, tables } from './drizzle'
import { embedMany } from 'ai'
import * as fs from 'node:fs'

async function runSeed() {
  const welcome = await fs.readFileSync(
    './seed/welcome.md'
  )

  const policies = await fs.readFileSync(
    './seed/policies.md'
  )

  const guide = await fs.readFileSync(
    './seed/guide.md'
  )

  const textSplitter = new CharacterTextSplitter({
    separator: '--------------------------------------------------------------------------------',
    chunkSize: 1000,
    chunkOverlap: 200
  })

  const data = await textSplitter.createDocuments([
    welcome.toString(),
    policies.toString(),
    guide.toString()
  ],
  [
    { document: 'Welcome' },
    { document: 'Policies' },
    { document: 'Guide' }
  ])

  const ollama = useOllama()

  const model = ollama.textEmbeddingModel('bge-m3')

  const { embeddings } = await embedMany({
    model: model,
    values: data.map(snippet => snippet.pageContent)
  })

  const db = useDrizzle()

  const mappedData = data.map((snippet, index) => {
    console.log(embeddings[index].length)
    return {
      title: `${snippet.metadata.document}[${index}]`,
      description: snippet.pageContent,
      embedding: embeddings[index]
    }
  })

  await db.insert(tables.guides).values(mappedData)

  return { result: 'Success' }
}

export { runSeed }
