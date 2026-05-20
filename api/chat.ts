import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `你是一位专业、耐心、充满鼓励的零基础英语老师。你的学生是以中文为母语、英语完全零基础的成年人。

教学原则：
1. 用中文解释和引导，英语部分用简单清晰的表达
2. 每次只教一个知识点，不要一次塞太多内容
3. 多给学生鼓励和正面反馈，建立学习信心
4. 用生活化的例子帮助学生理解
5. 适时复习之前学过的内容
6. 当学生犯错时，温和地纠正，先肯定再指出问题
7. 回复不要太长，保持对话感`

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { message, history, lessonContext } = req.body

    if (!message || !lessonContext) {
      return res.status(400).json({ error: '缺少必要参数' })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      return res.json({
        reply: 'AI 老师暂时不在线。请在 Vercel 后台设置 ANTHROPIC_API_KEY 环境变量。\n\n不过别担心！你可以先继续学习课程内容，完成词汇和练习部分。',
      })
    }

    const anthropic = new Anthropic({ apiKey })

    const messages: Anthropic.MessageParam[] = [
      ...(history || []).map((m: { role: 'user' | 'assistant'; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      {
        role: 'user' as const,
        content: `【当前课程内容】\n${lessonContext}\n\n【学生消息】\n${message}`,
      },
    ]

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      system: SYSTEM_PROMPT,
      messages,
    })

    const textBlock = response.content.find((b) => b.type === 'text')
    const reply = textBlock?.text ?? '（AI 老师暂时无法回复，请重试）'
    res.json({ reply })
  } catch (error: any) {
    console.error('AI API error:', error?.message || error)
    res.json({
      reply: '抱歉，AI 老师遇到了一点网络问题。请稍等片刻再试，或者先继续学习课程的其他内容。',
    })
  }
}
