import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `你是一位专业、耐心、充满鼓励的零基础英语老师。你的学生是以中文为母语、英语完全零基础的成年人。

教学原则：
1. 用中文解释和引导，英语部分用简单清晰的表达
2. 每次只教一个知识点，不要一次塞太多内容
3. 多给学生鼓励和正面反馈，建立学习信心
4. 用生活化的例子帮助学生理解
5. 适时复习之前学过的内容
6. 当学生犯错时，温和地纠正，先肯定再指出问题
7. 回复不要太长，保持对话感

当前你正在教的课程内容会通过用户消息提供。请根据课程内容和学生的水平进行互动教学。`

export async function chatWithAI(
  userMessage: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  lessonContext: string,
  userApiKey?: string
): Promise<string> {
  const apiKey = userApiKey || process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return 'AI 老师暂时不在线。请点击页面右上角的 ⚙️ 设置按钮，输入你的 Anthropic API Key 后即可使用。\n\n还没有 API Key？去 https://console.anthropic.com 申请一个吧！\n\n不过别担心！你可以先继续学习当前课程的内容，完成词汇和练习部分。等老师上线了再来练习对话哦！'
  }

  try {
    const anthropic = new Anthropic({ apiKey })

    const messages: Anthropic.MessageParam[] = [
      ...history.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      {
        role: 'user',
        content: `【当前课程内容】\n${lessonContext}\n\n【学生消息】\n${userMessage}`,
      },
    ]

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      system: SYSTEM_PROMPT,
      messages,
    })

    const textBlock = response.content.find((b) => b.type === 'text')
    return textBlock?.text ?? '（AI 老师暂时无法回复，请重试）'
  } catch (error) {
    console.error('AI API error:', error)
    return '抱歉，AI 老师遇到了一点网络问题。请稍等片刻再试，或者先继续学习课程的其他内容。'
  }
}

export function buildLessonContext(lesson: {
  title: string
  vocabulary: { word: string; meaning: string; example: string; exampleCn: string }[]
  grammar: { title: string; explanation: string; examples: { en: string; cn: string }[] }[]
  sentences: { en: string; cn: string }[]
}): string {
  const parts: string[] = []
  parts.push(`课程主题：${lesson.title}`)

  if (lesson.vocabulary.length > 0) {
    parts.push(
      '词汇：' + lesson.vocabulary.map((v) => `${v.word}(${v.meaning})`).join('、')
    )
  }

  if (lesson.grammar.length > 0) {
    parts.push('语法：' + lesson.grammar.map((g) => g.title + ' - ' + g.explanation).join('；'))
  }

  if (lesson.sentences.length > 0) {
    parts.push('例句：' + lesson.sentences.map((s) => s.en + '（' + s.cn + '）').join('；'))
  }

  return parts.join('\n')
}
