import { onUnmounted } from 'vue'

export function useAudioPlayer() {
  let audioContext: AudioContext | null = null
  let nextStartTime = 0
  let queuePromise = Promise.resolve()

  const activeSources: AudioBufferSourceNode[] = []
  let queueGeneration = 0

  /**
   * Inicializa o contexto.
   */
  const initContext = () => {
    if (!audioContext) {
      const AudioContextCtor = window.AudioContext
        || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext

      audioContext = new AudioContextCtor()
    } else if (audioContext.state === 'suspended') {
      audioContext.resume()
    }
  }

  const base64ToArrayBuffer = (base64: string) => {
    const binaryString = window.atob(base64)
    const len = binaryString.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes.buffer
  }

  const clearQueue = () => {
    queueGeneration++

    activeSources.forEach((source) => {
      try {
        source.stop()
      } catch {
        // ignore
      }
      source.disconnect()
    })

    activeSources.length = 0

    if (audioContext) {
      nextStartTime = audioContext.currentTime
    } else {
      nextStartTime = 0
    }

    queuePromise = Promise.resolve()
  }

  const enqueueAudio = (base64: string) => {
    if (!base64) return

    const currentGeneration = queueGeneration

    queuePromise = queuePromise.then(async () => {
      if (currentGeneration !== queueGeneration) return
      if (!audioContext) return

      try {
        const arrayBuffer = base64ToArrayBuffer(base64)
        if (currentGeneration !== queueGeneration) return

        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
        if (currentGeneration !== queueGeneration) return

        const source = audioContext.createBufferSource()
        source.buffer = audioBuffer
        source.connect(audioContext.destination)

        activeSources.push(source)

        source.onended = () => {
          const index = activeSources.indexOf(source)
          if (index > -1) {
            activeSources.splice(index, 1)
          }
        }

        const currentTime = audioContext.currentTime

        if (nextStartTime < currentTime) {
          nextStartTime = currentTime + 0.05
        }

        source.start(nextStartTime)
        nextStartTime += audioBuffer.duration
      } catch (error) {
        if (currentGeneration === queueGeneration) {
          console.error('Audio processing error:', error)
        }
      }
    })
  }

  onUnmounted(() => {
    clearQueue()
    if (audioContext) audioContext.close()
  })

  return {
    initContext,
    enqueueAudio,
    clearQueue
  }
}
