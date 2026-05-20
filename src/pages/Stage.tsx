import { useParams, Link, Navigate } from 'react-router-dom'
import { stages } from '../data/curriculum'
import { useProgress } from '../contexts/ProgressContext'

export default function Stage() {
  const { stageId } = useParams<{ stageId: string }>()
  const stageIndex = stages.findIndex((s) => s.id === stageId)
  const stage = stages[stageIndex]
  const { progress, isLessonUnlocked, isStageUnlocked } = useProgress()

  if (!stage || !isStageUnlocked(stageIndex)) {
    return <Navigate to="/" replace />
  }

  const completed = progress.completedLessons.filter((id) => id.startsWith(stageId!)).length
  const total = stage.lessons.length
  const examPassed = stageId! in progress.examScores
  const examScore = progress.examScores[stageId!]

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link to="/" className="text-sm text-gray-400 hover:text-primary-500 transition-colors">← 返回首页</Link>
        <div className="flex items-center gap-4 mt-3">
          <span className="text-4xl">{stage.icon}</span>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold text-gray-800">{stage.name}：{stage.subtitle}</h1>
            <p className="text-gray-500 mt-1">{stage.description}</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>阶段进度</span>
            <span>{completed}/{total} 课</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary-400 to-primary-600 h-full rounded-full transition-all"
              style={{ width: `${total === 0 ? 0 : Math.round((completed / total) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Lessons */}
      <div className="space-y-3 mb-8">
        {stage.lessons.map((lesson, i) => {
          const unlocked = isLessonUnlocked(stage.id, i)
          const done = progress.completedLessons.includes(lesson.id)

          return (
            <div
              key={lesson.id}
              className={`card flex items-center gap-4 ${
                !unlocked ? 'opacity-50' : 'hover:border-primary-200 hover:shadow-md'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 ${
                  done
                    ? 'bg-green-100 text-green-600'
                    : unlocked
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {done ? '✓' : i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold ${done ? 'text-green-600' : unlocked ? 'text-gray-800' : 'text-gray-400'}`}>
                  {lesson.title}
                </h3>
                <p className="text-sm text-gray-400 mt-0.5">
                  {lesson.vocabulary.length} 个单词 · {lesson.grammar.length} 个语法点 · {lesson.exercises.length} 道练习
                </p>
              </div>
              {done ? (
                <span className="text-green-500 text-sm font-medium">已完成</span>
              ) : unlocked ? (
                <Link to={`/lesson/${lesson.id}`} className="btn-primary text-sm !px-4 !py-2">
                  开始学习
                </Link>
              ) : (
                <span className="text-gray-400 text-sm">🔒 先完成上一课</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Exam Section */}
      <div className="card border-2 border-accent-200 bg-accent-50/30">
        <div className="flex items-center gap-4">
          <span className="text-3xl">📝</span>
          <div className="flex-1">
            <h3 className="font-bold text-gray-800">阶段考试</h3>
            <p className="text-sm text-gray-500">
              {examPassed
                ? `已通过！得分：${examScore}/15`
                : completed < total
                ? `完成全部 ${total} 节课后解锁`
                : '准备好了！检验你的学习成果'}
            </p>
          </div>
          {completed >= total ? (
            examPassed ? (
              <Link to={`/exam/${stage.id}`} className="btn-outline text-sm !px-4 !py-2">
                重新考试
              </Link>
            ) : (
              <Link to={`/exam/${stage.id}`} className="btn-primary text-sm !px-4 !py-2">
                开始考试
              </Link>
            )
          ) : null}
        </div>
      </div>
    </div>
  )
}
