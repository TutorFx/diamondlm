import { textSplitter } from './langchain'
import { useOllama } from './ollama'
import { useDrizzle, tables } from './drizzle'
import { embedMany } from 'ai'
import * as fs from 'node:fs'

async function runSeed() {
  console.log('Iniciando o processo de seed...')

  const documentsToSeed = [
    {
      title: 'Welcome',
      content: fs.readFileSync('./seed/welcome.md', 'utf-8')
    },
    {
      title: 'Policies',
      content: fs.readFileSync('./seed/policies.md', 'utf-8')
    },
    {
      title: 'Guide',
      content: fs.readFileSync('./seed/guide.md', 'utf-8')
    }
  ]

  const db = useDrizzle()
  const ollama = useOllama()
  const model = ollama.textEmbeddingModel('bge-m3')

  console.log('Limpando tabelas existentes...')
  await db.delete(tables.chunk)
  await db.delete(tables.guides)

  for (const doc of documentsToSeed) {
    console.log(`Processando o guia: ${doc.title}...`)

    const [newGuide] = await db
      .insert(tables.guides)
      .values({
        title: doc.title,
        content: doc.content
      })
      .returning({ insertedId: tables.guides.id })

    const guideId = newGuide.insertedId
    console.log(`Guia "${doc.title}" criado com ID: ${guideId}.`)

    const chunks = await textSplitter.createDocuments([doc.content])
    if (chunks.length === 0) {
      console.log(`Nenhum chunk gerado para o guia "${doc.title}". Pulando.`)
      continue
    }

    console.log(`Gerando ${chunks.length} embeddings para os chunks...`)

    const { embeddings } = await embedMany({
      model: model,
      values: chunks.map(chunk => chunk.pageContent)
    })

    const chunksData = chunks.map((chunk, index) => {
      return {
        guideId: guideId,
        content: chunk.pageContent,
        embedding: embeddings[index]
      }
    })

    console.log(`Inserindo ${chunksData.length} chunks no banco de dados...`)
    await db.insert(tables.chunk).values(chunksData)
  }

  console.log('Processo de seed concluído com sucesso!')
  return { result: 'Success' }
}

export { runSeed }
