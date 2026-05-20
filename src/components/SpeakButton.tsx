import { useState, useCallback, useRef, useEffect } from 'react'

let cachedVoices: SpeechSynthesisVoice[] = []

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) { resolve([]); return }
    const voices = window.speechSynthesis.getVoices()
    if (voices.length > 0) {
      cachedVoices = voices as any
      resolve(cachedVoices)
      return
    }
    const handler = () => {
      cachedVoices = window.speechSynthesis.getVoices() as any
      window.speechSynthesis.removeEventListener('voiceschanged', handler)
      resolve(cachedVoices)
    }
    window.speechSynthesis.addEventListener('voiceschanged', handler)
    setTimeout(() => { window.speechSynthesis.removeEventListener('voiceschanged', handler); resolve([]) }, 3000)
  })
}

function pickEnglishVoice(): SpeechSynthesisVoice | null {
  const voices = cachedVoices.length > 0 ? cachedVoices : (window.speechSynthesis?.getVoices() || []) as any
  return (voices as any).find((v: SpeechSynthesisVoice) => v.lang === 'en-US' && v.name.includes('Google')) ||
    (voices as any).find((v: SpeechSynthesisVoice) => v.lang === 'en-US') ||
    (voices as any).find((v: SpeechSynthesisVoice) => v.lang.startsWith('en')) ||
    null
}

interface Props {
  text: string
  size?: 'sm' | 'md'
  label?: string
}

export default function SpeakButton({ text, size = 'md', label }: Props) {
  const [speaking, setSpeaking] = useState(false)
  const [unsupported, setUnsupported] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => { loadVoices() }, [])

  const speak = useCallback(async () => {
    if (!('speechSynthesis' in window)) { setUnsupported(true); return }

    // iOS Safari fix: cancel any existing speech first
    window.speechSynthesis.cancel()

    await loadVoices()

    const utterance = new SpeechSynthesisUtterance(text)
    const voice = pickEnglishVoice()
    if (voice) utterance.voice = voice
    utterance.lang = 'en-US'
    utterance.rate = size === 'sm' ? 0.8 : 0.85
    utterance.pitch = 1
    utterance.volume = 1

    setSpeaking(true)
    setUnsupported(false)

    utterance.onend = () => {
      setSpeaking(false)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    utterance.onerror = (e) => {
      setSpeaking(false)
      if (timerRef.current) clearTimeout(timerRef.current)
      // iOS Safari sometimes fails silently
      console.log('Speech error:', e)
    }

    // iOS Safari: must call speak after a small delay
    setTimeout(() => window.speechSynthesis.speak(utterance), 50)

    timerRef.current = setTimeout(() => setSpeaking(false), 10000)
  }, [text, size])

  const sizeClass = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-8 h-8 text-sm'

  if (unsupported) {
    return (
      <button disabled className={`${sizeClass} rounded-full flex items-center justify-center flex-shrink-0 bg-gray-100 text-gray-300`} title="浏览器不支持朗读">
        🔇
      </button>
    )
  }

  return (
    <button
      onClick={speak}
      disabled={speaking}
      className={`${sizeClass} rounded-full flex items-center justify-center transition-all flex-shrink-0 active:scale-90 ${
        speaking
          ? 'bg-primary-500 text-white animate-pulse'
          : 'bg-gray-100 text-gray-400 hover:bg-primary-100 hover:text-primary-600'
      }`}
      title={label || `朗读: ${text}`}
    >
      {speaking ? '🔊' : '🔈'}
    </button>
  )
}

export async function speakText(text: string) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  await loadVoices()
  const utterance = new SpeechSynthesisUtterance(text)
  const voice = pickEnglishVoice()
  if (voice) utterance.voice = voice
  utterance.lang = 'en-US'
  utterance.rate = 0.85
  setTimeout(() => window.speechSynthesis.speak(utterance), 50)
}
