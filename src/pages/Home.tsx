import { stages } from '../data/curriculum'
import StageCard from '../components/StageCard'
import { useProgress } from '../contexts/ProgressContext'

export default function Home() {
  const { progress } = useProgress()
  const totalLessons = stages.reduce((sum, s) => sum + s.lessons.length, 0)
  const doneLessons = progress.completedLessons.length
  const totalPct = totalLessons === 0 ? 0 : Math.round((doneLessons / totalLessons) * 100)

  return (
    <div>
      {/* Hero */}
      <div className="text-center py-8 mb-6">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-3">
          📚 从零开始学英语
        </h1>
        <p className="text-lg text-gray-500 max-w-md mx-auto">
          专为零基础学习者设计的英语课程，一步一步带你学会英语
        </p>
        {doneLessons > 0 && (
          <div className="mt-6 max-w-sm mx-auto">
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>总体学习进度</span>
              <span>{doneLessons}/{totalLessons} 课 ({totalPct}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary-400 to-primary-600 h-full rounded-full transition-all duration-700"
                style={{ width: `${totalPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stage List */}
      <div className="space-y-4">
        {stages.map((stage, i) => (
          <StageCard key={stage.id} stage={stage} index={i} />
        ))}
      </div>

      {/* Tips */}
      <div className="card mt-8 text-center">
        <h3 className="font-bold text-gray-700 mb-2">学习小贴士</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-500">
          <div>
            <span className="text-2xl block mb-1">📖</span>
            <p>每天学一课，保持学习节奏</p>
          </div>
          <div>
            <span className="text-2xl block mb-1">🗣️</span>
            <p>大声跟读，不要怕犯错</p>
          </div>
          <div>
            <span className="text-2xl block mb-1">🤖</span>
            <p>和AI老师多练习对话</p>
          </div>
        </div>
      </div>
    </div>
  )
}
