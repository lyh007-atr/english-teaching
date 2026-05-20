import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { UserProgress, ChatMessage } from '../types'

interface ProgressContextType {
  progress: UserProgress
  markLessonComplete: (lessonId: string) => void
  saveExamScore: (stageId: string, score: number) => void
  saveChatHistory: (lessonId: string, history: ChatMessage[]) => void
  getLessonProgress: (stageId: string) => { done: number; total: number }
  isStageUnlocked: (stageIndex: number) => boolean
  isLessonUnlocked: (stageId: string, lessonIndex: number) => boolean
}

const defaultProgress: UserProgress = {
  completedLessons: [],
  examScores: {},
  aiChatHistory: {},
}

function loadProgress(): UserProgress {
  try {
    const data = localStorage.getItem('english-learning-progress')
    return data ? { ...defaultProgress, ...JSON.parse(data) } : defaultProgress
  } catch {
    return defaultProgress
  }
}

const ProgressContext = createContext<ProgressContextType | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<UserProgress>(loadProgress)

  useEffect(() => {
    localStorage.setItem('english-learning-progress', JSON.stringify(progress))
  }, [progress])

  const markLessonComplete = useCallback((lessonId: string) => {
    setProgress((p) => {
      if (p.completedLessons.includes(lessonId)) return p
      return { ...p, completedLessons: [...p.completedLessons, lessonId] }
    })
  }, [])

  const saveExamScore = useCallback((stageId: string, score: number) => {
    setProgress((p) => ({
      ...p,
      examScores: { ...p.examScores, [stageId]: score },
    }))
  }, [])

  const saveChatHistory = useCallback((lessonId: string, history: ChatMessage[]) => {
    setProgress((p) => ({
      ...p,
      aiChatHistory: { ...p.aiChatHistory, [lessonId]: history },
    }))
  }, [])

  const getLessonProgress = useCallback((stageId: string) => {
    const lessons = progress.completedLessons.filter((id) => id.startsWith(stageId))
    return { done: lessons.length, total: 0 }
  }, [progress.completedLessons])

  const isStageUnlocked = useCallback(
    (stageIndex: number) => {
      if (stageIndex === 0) return true
      const prevStageId = `stage-${stageIndex - 1}`
      return prevStageId in progress.examScores
    },
    [progress.examScores]
  )

  const isLessonUnlocked = useCallback(
    (stageId: string, lessonIndex: number) => {
      if (lessonIndex === 0) return true
      const lessonId = `${stageId.replace('stage', 'lesson')}-${lessonIndex}`
      return progress.completedLessons.includes(lessonId)
    },
    [progress.completedLessons]
  )

  return (
    <ProgressContext.Provider
      value={{
        progress,
        markLessonComplete,
        saveExamScore,
        saveChatHistory,
        getLessonProgress,
        isStageUnlocked,
        isLessonUnlocked,
      }}
    >
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const ctx = useContext(ProgressContext)
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider')
  return ctx
}
