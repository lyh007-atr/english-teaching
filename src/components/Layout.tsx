import { ReactNode, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useApiKey } from '../contexts/ApiKeyContext'
import SettingsModal from './SettingsModal'

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { hasKey } = useApiKey()

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <span className="text-3xl">📚</span>
            <div>
              <h1 className="text-lg font-bold text-gray-800">从零开始学英语</h1>
              <p className="text-xs text-gray-400">English for Beginners</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSettingsOpen(true)}
              className={`text-sm px-3 py-2 rounded-lg transition-all ${
                hasKey
                  ? 'bg-green-50 text-green-600 hover:bg-green-100'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              title="设置"
            >
              ⚙️ {hasKey ? '已连接AI' : '设置'}
            </button>
            {!isHome && (
              <Link to="/" className="btn-outline text-sm !px-4 !py-2">
                返回首页
              </Link>
            )}
          </div>
        </div>
      </header>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-6 w-full">
        {children}
      </main>

      <footer className="bg-white/50 border-t border-gray-100 py-6 mt-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-400">
          <p>从零开始学英语 — 每天进步一点点</p>
          <p className="mt-1">坚持学习，你一定能学会英语！</p>
        </div>
      </footer>
    </div>
  )
}
