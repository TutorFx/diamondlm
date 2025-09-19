import { Index } from '@upstash/vector'
import { CharacterTextSplitter } from '@langchain/textsplitters'
import * as fs from 'node:fs'

const welcome = await fs.readFileSync(
  './seed/welcome.md'
)

const policies = await fs.readFileSync(
  './seed/policies.md'
)

const guide = await fs.readFileSync(
  './seed/guide.md'
)

async function main() {
  const vectorStore = new Index({
    url: process.env.UPSTASH_VECTOR_REST_URL,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN
  })

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

  console.log(data)

  await vectorStore.upsert(data.map((snippet, index) => {
    return {
      metadata: { document: snippet.metadata.document },
      id: `${snippet.metadata.document}-${index}`,
      data: snippet.pageContent
    }
  }))
}

main()
  .catch(e => console.error(e))
  .finally(async () => {

  })
