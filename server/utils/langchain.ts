import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export const textSplitter = new RecursiveCharacterTextSplitter({
  separators: [
    "--------------------------------------------------------------------------------",
    "\n\n",
    ".",
    "\u200b",  // Zero-width space
    "\uff0c",  // Fullwidth comma
    "\u3001",  // Ideographic comma
    "\uff0e",  // Fullwidth full stop
    "\u3002",  // Ideographic stop
    ""
  ],
  chunkSize: 1000,
  chunkOverlap: 100
})

export async function splitText(settings: { title: string, content: string }) {
  return await textSplitter.createDocuments([
    settings.content
  ],
    [
      { document: settings.title }
    ])
}
