import { useState } from 'react'
import { Exercise } from '../types'

export default function Quiz({ exercises, onComplete }: { exercises: Exercise[]; onComplete: () => void }) {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [showingResult, setShowingResult] = useState(false)

  const ex = exercises[current]
  if (!ex) return null

  const handleAnswer = (value: string) => {
    if (submitted) return
    setAnswers({ ...answers, [current]: value })
    setShowingResult(true)
    setTimeout(() => {
      setShowingResult(false)
      if (current < exercises.length - 1) {
        setCurrent(current + 1)
      }
      setSubmitted(false)
    }, 1500)
  }

  const isCorrect = answers[current]?.trim().toLowerCase() === ex.answer.trim().toLowerCase()

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800">小练习</h3>
        <span className="text-sm text-gray-400">{current + 1}/{exercises.length}</span>
      </div>

      <div className="mb-4">
        <p className="text-gray-700 mb-3">{ex.question}</p>

        {ex.type === 'choice' && ex.options && (
          <div className="space-y-2">
            {ex.options.map((opt) => {
              let btnClass = 'w-full text-left px-4 py-3 rounded-xl border-2 transition-all '
              if (answers[current] === opt && showingResult) {
                btnClass += isCorrect
                  ? 'border-green-400 bg-green-50 text-green-700'
                  : 'border-red-400 bg-red-50 text-red-700'
              } else if (answers[current] === opt) {
                btnClass += 'border-primary-400 bg-primary-50'
              } else {
                btnClass += 'border-gray-200 hover:border-gray-300'
              }
              return (
                <button key={opt} onClick={() => handleAnswer(opt)} disabled={!!answers[current]} className={btnClass}>
                  {opt}
                </button>
              )
            })}
          </div>
        )}

        {ex.type === 'fill' && (
          <div>
            <input
              value={answers[current] || ''}
              onChange={(e) => setAnswers({ ...answers, [current]: e.target.value })}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAnswer(answers[current] || '') }}
              placeholder="输入你的答案..."
              className="input-field"
              disabled={!!answers[current]}
            />
            {!answers[current] && (
              <button
                onClick={() => handleAnswer(answers[current] || '')}
                className="btn-primary mt-3 text-sm"
              >
                确认
              </button>
            )}
          </div>
        )}

        {ex.type === 'match' && (
          <p className="text-gray-400 italic">请思考并口头回答，然后点击"已掌握"</p>
        )}
      </div>

      {showingResult && (
        <div className={`p-3 rounded-xl ${isCorrect ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {isCorrect ? '✅ 正确！太棒了！' : `❌ 正确答案是：${ex.answer}`}
        </div>
      )}

      <div className="flex gap-1 mt-3">
        {exercises.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full ${
              answers[i] ? (answers[i]?.trim().toLowerCase() === exercises[i].answer.trim().toLowerCase() ? 'bg-green-400' : 'bg-red-400') : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {current === exercises.length - 1 && answers[current] && !showingResult && (
        <button onClick={onComplete} className="btn-primary w-full mt-4">
          完成练习，继续学习
        </button>
      )}
    </div>
  )
}
