import { onUnmounted } from 'vue'

export function useAudioPlayer() {
  let audioContext: AudioContext | null = null

  let nextStartTime = 0

  let queuePromise = Promise.resolve()

  /**
   * Inicializa o contexto. OBRIGATÓRIO chamar em um clique do usuário.
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

  /**
   * Transforma Base64 em ArrayBuffer
   */
  const base64ToArrayBuffer = (base64: string) => {
    const binaryString = window.atob(base64)
    const len = binaryString.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes.buffer
  }

  /**
   * Recebe o base64, decodifica e agenda.
   */
  const enqueueAudio = (base64: string) => {
    if (!base64) return

    queuePromise = queuePromise.then(async () => {
      if (!audioContext) return

      try {
        const arrayBuffer = base64ToArrayBuffer(base64)

        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

        const source = audioContext.createBufferSource()
        source.buffer = audioBuffer
        source.connect(audioContext.destination)

        const currentTime = audioContext.currentTime

        if (nextStartTime < currentTime) {
          nextStartTime = currentTime + 0.05
        }

        source.start(nextStartTime)

        nextStartTime += audioBuffer.duration
      } catch (error) {
        console.error('Erro ao processar chunk de áudio:', error)
      }
    })
  }

  onUnmounted(() => {
    if (audioContext) audioContext.close()
  })

  return {
    initContext,
    enqueueAudio
  }
}
