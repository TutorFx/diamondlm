import { CharacterTextSplitter } from '@langchain/textsplitters'

export const textSplitter = new CharacterTextSplitter({
  separator: '--------------------------------------------------------------------------------',
  chunkSize: 1000,
  chunkOverlap: 200
})

export async function splitText(settings: { title: string, content: string }) {
  return await textSplitter.createDocuments([
    settings.content
  ],
  [
    { document: settings.title }
  ])
}
