import { useState, useCallback } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { stages } from '../data/curriculum'
import { useProgress } from '../contexts/ProgressContext'
import { useApiKey } from '../contexts/ApiKeyContext'
import { ChatMessage } from '../types'
import AITeacher from '../components/AITeacher'
import Quiz from '../components/Quiz'
import SpeakButton, { speakText } from '../components/SpeakButton'

function findLesson(lessonId: string) {
  for (const s of stages) {
    const l = s.lessons.find((l) => l.id === lessonId)
    if (l) return { stage: s, lesson: l }
  }
  return null
}

export default function Lesson() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const result = lessonId ? findLesson(lessonId) : null
  const { progress, markLessonComplete, saveChatHistory } = useProgress()
  const { apiKey } = useApiKey()

  const [tab, setTab] = useState<'content' | 'practice' | 'chat'>('content')
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    return (lessonId && progress.aiChatHistory[lessonId]) || []
  })
  const [aiLoading, setAiLoading] = useState(false)
  const [quizDone, setQuizDone] = useState(false)

  if (!result) return <Navigate to="/" replace />
  const { stage, lesson } = result

  const stageIndex = stages.findIndex((s) => s.id === stage.id)
  const lessonIndex = stage.lessons.findIndex((l) => l.id === lesson.id)
  const isDone = progress.completedLessons.includes(lesson.id)

  const handleAISend = useCallback(async (message: string) => {
    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: message }]
    setChatHistory(newHistory)
    setAiLoading(true)

    try {
      const lessonContext = [
        `课程：${lesson.title}`,
        '词汇：' + lesson.vocabulary.map((v) => `${v.word}(${v.meaning})`).join('、'),
        '语法：' + lesson.grammar.map((g) => `${g.title}: ${g.explanation}`).join('；'),
        '例句：' + lesson.sentences.map((s) => `${s.en}(${s.cn})`).join('；'),
      ].join('\n')

      const apiUrl = `${import.meta.env.VITE_API_URL}/chat`
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: chatHistory.slice(-10),
          lessonContext,
          apiKey: apiKey || undefined,
        }),
      })
      const data = await res.json()
      const reply = data.reply || '抱歉，AI老师暂时无法回复。'
      const updated = [...newHistory, { role: 'assistant', content: reply } as ChatMessage]
      setChatHistory(updated)
      if (lessonId) saveChatHistory(lessonId, updated)
    } catch {
      const fallback = [...newHistory, { role: 'assistant', content: '抱歉，网络连接出现问题。请检查后端服务是否启动。' } as ChatMessage]
      setChatHistory(fallback)
    }
    setAiLoading(false)
  }, [chatHistory, lesson, lessonId, saveChatHistory])

  const handleQuizComplete = () => {
    setQuizDone(true)
    markLessonComplete(lesson.id)
  }

  const tabs = [
    { key: 'content' as const, label: '📖', fullLabel: '学习' },
    { key: 'practice' as const, label: '✏️', fullLabel: '练习' },
    { key: 'chat' as const, label: '🤖', fullLabel: 'AI老师' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <Link to={`/stage/${stage.id}`} className="text-xs sm:text-sm text-gray-400 hover:text-primary-500 transition-colors">
          ← 返回{stage.subtitle}
        </Link>
        <div className="flex items-center gap-2 sm:gap-3 mt-1 sm:mt-2">
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl font-extrabold text-gray-800">{lesson.title}</h1>
            <p className="text-xs sm:text-sm text-gray-400">
              第{lessonIndex + 1}课 · {stage.name}
              {isDone && <span className="ml-1 sm:ml-2 text-green-500 text-xs sm:text-sm">✅</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-12 sm:top-14 z-40 bg-gray-100 p-1 rounded-xl mb-4 sm:mb-6 flex gap-1 sm:gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              tab === t.key ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="sm:hidden">{t.label}</span>
            <span className="hidden sm:inline">{t.label} {t.fullLabel}</span>
          </button>
        ))}
      </div>

      {/* Tab: Content */}
      {tab === 'content' && (
        <div className="space-y-6">
          {/* Vocabulary */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">📝 本课词汇 ({lesson.vocabulary.length})</h3>
              <button
                onClick={() => speakText(lesson.vocabulary.map((v) => v.word).join('. '))}
                className="text-xs px-3 py-1.5 rounded-full bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
              >
                🔊 朗读全部
              </button>
            </div>
            <div className="space-y-3">
              {lesson.vocabulary.map((v) => (
                <div key={v.word} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <SpeakButton text={v.word} size="sm" label={`朗读 ${v.word}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary-700 text-lg">{v.word}</span>
                      <span className="text-sm text-gray-400">{v.pronunciation}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{v.meaning}</p>
                    <p className="text-xs text-gray-400 mt-1 italic">
                      {v.example} — {v.exampleCn}
                    </p>
                  </div>
                  <SpeakButton text={v.example} size="sm" label={`朗读例句`} />
                </div>
              ))}
            </div>
          </div>

          {/* Grammar */}
          {lesson.grammar.map((g, i) => (
            <div key={i} className="card">
              <h3 className="font-bold text-gray-800 mb-3">📐 {g.title}</h3>
              <p className="text-gray-600 mb-3 text-sm leading-relaxed">{g.explanation}</p>
              <div className="space-y-2">
                {g.examples.map((ex, j) => (
                  <div key={j} className="p-3 bg-blue-50 rounded-xl flex items-start gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-primary-800">{ex.en}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{ex.cn}</p>
                    </div>
                    <SpeakButton text={ex.en} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Sentences */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">💬 本课例句</h3>
              <button
                onClick={() => speakText(lesson.sentences.map((s) => s.en).join('. '))}
                className="text-xs px-3 py-1.5 rounded-full bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
              >
                🔊 朗读全部
              </button>
            </div>
            <div className="space-y-2">
              {lesson.sentences.map((s, i) => (
                <div key={i} className="flex items-start gap-2 p-2">
                  <span className="text-primary-400 font-bold text-sm min-w-[1.5rem]">{i + 1}.</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{s.en}</p>
                    <p className="text-sm text-gray-400">{s.cn}</p>
                  </div>
                  <SpeakButton text={s.en} size="sm" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Practice */}
      {tab === 'practice' && (
        <div className="space-y-6">
          {!quizDone ? (
            <Quiz exercises={lesson.exercises} onComplete={handleQuizComplete} />
          ) : (
            <div className="card text-center py-10">
              <span className="text-5xl block mb-4">🎉</span>
              <h3 className="text-xl font-bold text-green-600 mb-2">练习完成！</h3>
              <p className="text-gray-500">
                你已经掌握了本课内容！
                {!isDone && ' 课程已标记为完成。'}
              </p>
              <button
                onClick={() => setTab('chat')}
                className="btn-primary mt-6"
              >
                去和AI老师练习对话 →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab: Chat */}
      {tab === 'chat' && (
        <AITeacher
          history={chatHistory}
          onSend={handleAISend}
          loading={aiLoading}
          quickPrompts={[
            '请教我读这些单词',
            '这个语法我不太明白',
            '能和我用这些单词对话吗',
            '给我出几道练习题',
          ]}
        />
      )}

      {/* Bottom Nav */}
      <div className="flex justify-between mt-8 pt-4 border-t border-gray-100">
        {lessonIndex > 0 ? (
          <Link
            to={`/lesson/${stage.lessons[lessonIndex - 1].id}`}
            className="text-sm text-gray-400 hover:text-primary-500"
          >
            ← 上一课
          </Link>
        ) : (
          <span />
        )}
        {lessonIndex < stage.lessons.length - 1 && (
          <Link
            to={`/lesson/${stage.lessons[lessonIndex + 1].id}`}
            className="btn-primary text-sm !px-4 !py-2"
          >
            下一课 →
          </Link>
        )}
        {lessonIndex === stage.lessons.length - 1 && (
          <Link to={`/exam/${stage.id}`} className="btn-primary text-sm !px-4 !py-2 bg-accent-500 hover:bg-accent-600">
            去考试 →
          </Link>
        )}
      </div>
    </div>
  )
}
