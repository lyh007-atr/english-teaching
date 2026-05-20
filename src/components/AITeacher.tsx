import { useState, useRef, useEffect } from 'react'
import { ChatMessage } from '../types'

interface Props {
  history: ChatMessage[]
  onSend: (message: string) => void
  loading: boolean
  quickPrompts?: string[]
}

export default function AITeacher({ history, onSend, loading, quickPrompts = [] }: Props) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const handleSend = () => {
    const msg = input.trim()
    if (!msg || loading) return
    onSend(msg)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="card flex flex-col" style={{ height: 'calc(100dvh - 180px)', minHeight: '400px' }}>
      <div className="flex items-center gap-2 sm:gap-3 mb-3 pb-2 border-b border-gray-100 flex-shrink-0">
        <span className="text-xl sm:text-2xl">🤖</span>
        <div>
          <h3 className="font-bold text-gray-800 text-sm sm:text-base">AI 英语老师</h3>
          <p className="text-[10px] sm:text-xs text-gray-400">随时练习英语对话</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 sm:space-y-3 mb-3 pr-1">
        {history.length === 0 && (
          <div className="text-center text-gray-400 py-6 sm:py-10">
            <p className="text-3xl sm:text-4xl mb-2 sm:mb-3">👋</p>
            <p className="text-sm sm:text-base">开始和AI老师对话吧！</p>
            <p className="text-xs sm:text-sm mt-1">你可以用英语或中文和老师交流</p>
          </div>
        )}
        {history.map((msg, i) => (
          <div
            key={i}
            className={`animate-msg flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[80%] px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-primary-500 text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-800 rounded-bl-md'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-msg">
            <div className="bg-gray-100 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {quickPrompts.length > 0 && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 flex-shrink-0">
          {quickPrompts.map((p) => (
            <button
              key={p}
              onClick={() => onSend(p)}
              disabled={loading}
              className="text-[10px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 flex-shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="和老师聊天..."
          disabled={loading}
          className="input-field flex-1 text-sm"
        />
        <button onClick={handleSend} disabled={loading || !input.trim()} className="btn-primary !px-3 sm:!px-4 text-sm whitespace-nowrap">
          发送
        </button>
      </div>
    </div>
  )
}
