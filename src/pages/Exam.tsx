import { useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { stages } from '../data/curriculum'
import { useProgress } from '../contexts/ProgressContext'
import { ExamResult } from '../types'

export default function Exam() {
  const { stageId } = useParams<{ stageId: string }>()
  const stage = stages.find((s) => s.id === stageId)
  const { progress, saveExamScore } = useProgress()

  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<ExamResult | null>(null)

  if (!stage) return <Navigate to="/" replace />

  const completed = progress.completedLessons.filter((id) => id.startsWith(stageId!)).length
  if (completed < stage.lessons.length) {
    return <Navigate to={`/stage/${stageId}`} replace />
  }

  const exam = stage.exam
  const allAnswered = exam.every((_, i) => answers[i]?.trim())

  const handleSubmit = () => {
    const answerResults = exam.map((q, i) => {
      const userAnswer = answers[i]?.trim() || ''
      const correct = userAnswer.toLowerCase() === q.answer.toLowerCase()
      return { question: q.question, userAnswer, correctAnswer: q.answer, correct }
    })
    const score = answerResults.filter((a) => a.correct).length
    setResult({ total: exam.length, score, answers: answerResults })
    setSubmitted(true)
    saveExamScore(stage.id, score)
  }

  const passed = result && result.score >= result.total * 0.6

  if (submitted && result) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="card text-center py-10">
          <span className="text-6xl block mb-4">{passed ? '🎉' : '📚'}</span>
          <h1 className="text-2xl font-extrabold mb-2">
            {passed ? '恭喜通过考试！' : '还需要多复习一下'}
          </h1>
          <p className="text-gray-500 mb-2">
            你的得分：<span className={`text-2xl font-bold ${passed ? 'text-green-500' : 'text-orange-500'}`}>{result.score}</span> / {result.total}
          </p>
          <p className="text-sm text-gray-400 mb-6">
            {passed
              ? '你已经掌握了本阶段的内容，可以继续下一阶段的学习了！'
              : '别灰心，复习一下本阶段的课程，再试一次！'}
          </p>

          <div className="space-y-2 mb-6 text-left">
            {result.answers.map((a, i) => (
              <div key={i} className={`p-3 rounded-xl ${a.correct ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className="text-sm font-medium text-gray-700">{i + 1}. {a.question}</p>
                <p className="text-sm mt-1">
                  你的答案：<span className={a.correct ? 'text-green-600' : 'text-red-600'}>{a.userAnswer || '（未作答）'}</span>
                  {!a.correct && <span className="text-green-600 ml-2">正确答案：{a.correctAnswer}</span>}
                </p>
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center flex-wrap">
            <Link to={`/stage/${stage.id}`} className="btn-outline text-sm">
              返回课程
            </Link>
            {!passed && (
              <button onClick={() => { setSubmitted(false); setResult(null); setAnswers({}) }} className="btn-primary text-sm">
                重新考试
              </button>
            )}
            {passed && (
              <Link to="/" className="btn-primary text-sm">
                继续下一阶段 →
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6">
        <Link to={`/stage/${stage.id}`} className="text-sm text-gray-400 hover:text-primary-500">
          ← 返回课程
        </Link>
        <h1 className="text-2xl font-extrabold text-gray-800 mt-2">
          📝 {stage.name}考试
        </h1>
        <p className="text-gray-500 mt-1">
          共 {exam.length} 题 · 选择题直接点击，填空题手动输入 · 答对{Math.ceil(exam.length * 0.6)}题即可通过
        </p>
      </div>

      <div className="space-y-4">
        {exam.map((q, i) => (
          <div key={i} className="card">
            <p className="font-medium text-gray-800 mb-3">
              {i + 1}. {q.question}
              <span className="text-xs text-gray-400 ml-2">({q.type === 'choice' ? '选择题' : '填空题'})</span>
            </p>

            {q.type === 'choice' && q.options && (
              <div className="space-y-2">
                {q.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setAnswers({ ...answers, [i]: opt })}
                    className={`w-full text-left px-4 py-2.5 rounded-xl border-2 transition-all text-sm ${
                      answers[i] === opt
                        ? 'border-primary-400 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {q.type === 'fill' && (
              <input
                value={answers[i] || ''}
                onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
                placeholder="输入你的答案..."
                className="input-field text-sm"
              />
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!allAnswered}
        className="btn-primary w-full mt-6 text-lg"
      >
        提交答案
      </button>
      {!allAnswered && (
        <p className="text-center text-sm text-gray-400 mt-2">请回答所有题目后再提交</p>
      )}
    </div>
  )
}
