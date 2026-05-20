import { useState, useRef, useEffect } from 'react'
import { useApiKey } from '../contexts/ApiKeyContext'

export default function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { apiKey, setApiKey, clearApiKey, hasKey } = useApiKey()
  const [input, setInput] = useState('')
  const [saved, setSaved] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setInput(apiKey)
      setSaved(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open, apiKey])

  if (!open) return null

  const maskedKey = hasKey ? apiKey.slice(0, 7) + '...' + apiKey.slice(-4) : ''

  const handleSave = () => {
    const trimmed = input.trim()
    if (trimmed) {
      setApiKey(trimmed)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const handleClear = () => {
    clearApiKey()
    setInput('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-msg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800">⚙️ 设置</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>

        <div className="space-y-4">
          {/* API Key Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🤖 Anthropic API Key
            </label>
            <p className="text-xs text-gray-400 mb-2">
              输入你的 API Key 以使用 AI 英语老师功能。Key 仅保存在你的浏览器本地。
              <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline ml-1">
                去申请 →
              </a>
            </p>

            {hasKey && !showKey && (
              <div className="flex items-center gap-2 mb-2 p-2 bg-green-50 rounded-lg">
                <span className="text-green-600 text-sm">✅ 已设置：</span>
                <code className="text-xs text-green-700 font-mono">{maskedKey}</code>
                <button onClick={() => setShowKey(true)} className="text-xs text-primary-500 hover:underline ml-auto">查看</button>
              </div>
            )}

            {(showKey || !hasKey) && (
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="password"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="sk-ant-api03-..."
                  className="input-field text-sm flex-1"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
                />
                <button onClick={handleSave} disabled={!input.trim()} className="btn-primary text-sm !px-4">
                  保存
                </button>
              </div>
            )}

            {hasKey && (
              <button onClick={handleClear} className="text-xs text-red-400 hover:text-red-600 mt-2">
                清除已保存的 Key
              </button>
            )}

            {saved && (
              <p className="text-sm text-green-600 mt-2">✅ 已保存成功！</p>
            )}
          </div>

          {/* Info */}
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">💡 关于 AI 老师</h3>
            <ul className="text-xs text-gray-500 space-y-1.5">
              <li>· AI 老师基于 Claude 大模型，提供实时英语教学对话</li>
              <li>· 你的 API Key 仅保存在本地浏览器中</li>
              <li>· 每次对话都会消耗 API 额度（约 $0.01/次）</li>
              <li>· 没有 API Key 也能学习所有课程内容和做练习</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
