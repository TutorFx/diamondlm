export const useAudioSettings = () => {
  const cookie = useCookie<boolean>('audio_enabled', { default: () => true })
  const audioEnabled = useState<boolean>('audio_enabled_global', () => cookie.value)

  const toggleAudio = () => {
    audioEnabled.value = !audioEnabled.value
    cookie.value = audioEnabled.value
  }

  return {
    audioEnabled: readonly(audioEnabled),
    toggleAudio
  }
}
