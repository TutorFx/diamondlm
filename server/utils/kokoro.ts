import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { toString } from 'mdast-util-to-string'

export const audioTextSplitter = new RecursiveCharacterTextSplitter({
  separators: [
    '\n\n',
    '.',
    '!',
    '?',
    ':',
    ' ',
    '\u200b', // Zero-width space
    '\uff0c', // Fullwidth comma
    '\u3001', // Ideographic comma
    '\uff0e', // Fullwidth full stop
    '\u3002', // Ideographic stop
    ','
  ],
  chunkSize: 100,
  chunkOverlap: 0
})

type AudioHandler = {
  onAudioDelta?: (audio: ArrayBuffer) => void
  model: (text: string) => Promise<ArrayBuffer | null>
}

export function audioHandler(opt: AudioHandler) {
  const str: string[] = []
  let processedCount = 0
  let processing = Promise.resolve()

  async function pushStream(text: string) {
    str.push(text)
    processing = processing.then(() => triggerCheck())
    return processing
  }

  async function finishStream() {
    processing = processing.then(() => triggerCheck(true))
    return processing
  }

  async function triggerCheck(isFinish = false) {
    const currentText = str.join('')
    if (!currentText.trim()) return

    const tree = fromMarkdown(currentText)
    const strippedText = toString(tree)

    const chunks = await audioTextSplitter.createDocuments([strippedText])

    // Only process up to chunks.length - 1 if not finished
    const limit = isFinish ? chunks.length : chunks.length - 1

    for (let i = processedCount; i < limit; i++) {
      const chunk = chunks[i]
      const audio = await opt.model(chunk.pageContent)

      if (audio instanceof ArrayBuffer && opt.onAudioDelta) {
        opt.onAudioDelta(audio)
      }
      processedCount++
    }
  }

  return { pushStream, finishStream }
}

export async function kokoro(text: string) {
  const KOKORO_API_URL = process.env.KOKORO_API_URL || 'http://localhost:8880/v1/audio/speech'

  return await $fetch<ArrayBuffer>(KOKORO_API_URL, {
    method: 'POST',
    body: {
      model: 'kokoro',
      input: text,
      voice: 'pm_santa',
      response_format: 'mp3',
      speed: 1.0
    },
    responseType: 'arrayBuffer'
  }).catch(() => null)
}

// if (binary) {
//   return binary // Buffer.from(binary).toString('base64')
// } else {
//   return null
// }
