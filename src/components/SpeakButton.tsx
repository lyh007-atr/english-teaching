import { useState, useCallback, useRef } from 'react'

interface Props {
  text: string
  size?: 'sm' | 'md'
  label?: string
}

export default function SpeakButton({ text, size = 'md', label }: Props) {
  const [speaking, setSpeaking] = useState(false)
  const [error, setError] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const speak = useCallback(() => {
    if (!('speechSynthesis' in window)) {
      setError(true)
      return
    }

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)

    const voices = window.speechSynthesis.getVoices()
    const englishVoice =
      voices.find((v) => v.lang === 'en-US' && v.name.includes('Google')) ||
      voices.find((v) => v.lang === 'en-US') ||
      voices.find((v) => v.lang.startsWith('en'))

    if (englishVoice) {
      utterance.voice = englishVoice
    }
    utterance.lang = 'en-US'
    utterance.rate = size === 'sm' ? 0.8 : 0.85
    utterance.pitch = 1

    setSpeaking(true)
    setError(false)

    utterance.onend = () => {
      setSpeaking(false)
      if (timerRef.current) clearTimeout(timerRef.current)
    }

    utterance.onerror = () => {
      setSpeaking(false)
      if (timerRef.current) clearTimeout(timerRef.current)
    }

    window.speechSynthesis.speak(utterance)

    timerRef.current = setTimeout(() => {
      setSpeaking(false)
    }, 10000)
  }, [text, size])

  if (error) return null

  const sizeClass = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'

  return (
    <button
      onClick={speak}
      disabled={speaking}
      className={`${sizeClass} rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
        speaking
          ? 'bg-primary-500 text-white animate-pulse'
          : 'bg-gray-100 text-gray-400 hover:bg-primary-100 hover:text-primary-600'
      }`}
      title={label || `朗读: ${text}`}
      aria-label={label || `朗读: ${text}`}
    >
      {speaking ? '⏸' : '🔊'}
    </button>
  )
}

export function speakText(text: string) {
  if (!('speechSynthesis' in window)) return

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)

  const voices = window.speechSynthesis.getVoices()
  const englishVoice =
    voices.find((v) => v.lang === 'en-US' && v.name.includes('Google')) ||
    voices.find((v) => v.lang === 'en-US') ||
    voices.find((v) => v.lang.startsWith('en'))

  if (englishVoice) utterance.voice = englishVoice
  utterance.lang = 'en-US'
  utterance.rate = 0.85

  window.speechSynthesis.speak(utterance)
}
