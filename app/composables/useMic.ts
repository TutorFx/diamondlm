import { ref, shallowRef, onScopeDispose } from 'vue'

interface UseMicOptions {
  onResult?: (text: string) => void
  onError?: (error: SpeechRecognitionErrorEvent) => void
}

// Interfaces for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null
  onend: ((this: SpeechRecognition, ev: Event) => void) | null
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognition
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor
    webkitSpeechRecognition: SpeechRecognitionConstructor
  }
}

// Shared State (Singleton Pattern)
const isListening = ref(false)
const transcript = ref('')
const error = shallowRef<SpeechRecognitionErrorEvent | null>(null)

let recognition: SpeechRecognition | null = null
let queuePromise = Promise.resolve()

// We store the handlers globally but update them when a component "starts" or "resumes" the mic usage.
let activeCallback: ((text: string) => void) | null = null
let activeErrorCallback: ((error: SpeechRecognitionErrorEvent) => void) | null = null

export function useMic(options?: UseMicOptions) {
  // SSR Guard: SpeechRecognition is only available in the browser.
  const isSupported = typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition)

  const initRecognition = () => {
    if (recognition || !isSupported) return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'pt-BR'

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ''

      // Iterate through results starting from resultIndex to capture only new final parts
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i]
        if (result && result.isFinal && result.length > 0 && result[0]) {
          finalTranscript += result[0].transcript
        }
      }

      if (finalTranscript) {
        // Update the reactive transcript ref
        transcript.value = transcript.value ? `${transcript.value} ${finalTranscript}` : finalTranscript

        // Guarded callback execution (as implemented by the junior)
        queuePromise = queuePromise.then(async () => {
          if (activeCallback) {
            activeCallback(finalTranscript)
          }
        })
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('SpeechRecognition error', event)
      error.value = event
      if (activeErrorCallback) {
        activeErrorCallback(event)
      }
      isListening.value = false
    }

    recognition.onend = () => {
      isListening.value = false
    }
  }

  const start = () => {
    if (!isSupported) return
    initRecognition()

    // Register current instance's callbacks as the active ones for this session
    if (options?.onResult) activeCallback = options.onResult
    if (options?.onError) activeErrorCallback = options.onError

    if (isListening.value) return

    try {
      transcript.value = ''
      error.value = null
      recognition?.start()
      isListening.value = true
    } catch (e: unknown) {
      console.error('Failed to start recognition', e)
    }
  }

  const stop = () => {
    if (!recognition || !isListening.value) return
    recognition.stop()
    isListening.value = false
  }

  const toggle = () => {
    if (isListening.value) {
      stop()
    } else {
      start()
    }
  }

  // Cleanup: Stop the singleton mic if the component using it is unmounted
  onScopeDispose(() => {
    if (isListening.value) {
      stop()
    }
  })

  return {
    isListening,
    transcript,
    error,
    isSupported,
    start,
    stop,
    toggle
  }
}
