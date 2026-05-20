export interface Vocabulary {
  word: string
  pronunciation: string
  meaning: string
  example: string
  exampleCn: string
}

export interface GrammarPoint {
  title: string
  explanation: string
  examples: { en: string; cn: string }[]
}

export interface Exercise {
  type: 'choice' | 'fill' | 'match'
  question: string
  options?: string[]
  answer: string
}

export interface Lesson {
  id: string
  title: string
  order: number
  vocabulary: Vocabulary[]
  grammar: GrammarPoint[]
  sentences: { en: string; cn: string }[]
  exercises: Exercise[]
  aiPrompt: string
}

export interface Stage {
  id: string
  name: string
  subtitle: string
  icon: string
  description: string
  lessons: Lesson[]
  exam: ExamQuestion[]
}

export type ExamType = 'choice' | 'fill'

export interface ExamQuestion {
  type: ExamType
  question: string
  options?: string[]
  answer: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface UserProgress {
  completedLessons: string[]
  examScores: Record<string, number>
  aiChatHistory: Record<string, ChatMessage[]>
}

export interface ExamResult {
  total: number
  score: number
  answers: { question: string; userAnswer: string; correctAnswer: string; correct: boolean }[]
}
