import { Link } from 'react-router-dom'
import { Stage } from '../types'
import { useProgress } from '../contexts/ProgressContext'

export default function StageCard({ stage, index }: { stage: Stage; index: number }) {
  const { isStageUnlocked, getLessonProgress } = useProgress()
  const unlocked = isStageUnlocked(index)
  const { done } = getLessonProgress(stage.id)
  const total = stage.lessons.length
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)

  if (!unlocked) {
    return (
      <div className="card opacity-50 cursor-not-allowed">
        <div className="flex items-center gap-4">
          <span className="text-4xl">🔒</span>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-400">{stage.name}：{stage.subtitle}</h3>
            <p className="text-sm text-gray-400 mt-1">请先完成上一阶段的考试</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Link to={`/stage/${stage.id}`} className="card block hover:border-primary-200 hover:shadow-lg transition-all group">
      <div className="flex items-start gap-4">
        <span className="text-4xl">{stage.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-800 group-hover:text-primary-600 transition-colors">
            {stage.name}：{stage.subtitle}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{stage.description}</p>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>学习进度</span>
              <span>{done}/{total} 课</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary-400 to-primary-600 h-full rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
        <span className="text-gray-300 group-hover:text-primary-400 transition-colors text-xl">→</span>
      </div>
    </Link>
  )
}
