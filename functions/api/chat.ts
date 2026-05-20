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

export async function onRequest(context: any) {
  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await context.request.json()
    const { message, history, lessonContext } = body

    if (!message || !lessonContext) {
      return new Response(JSON.stringify({ error: '缺少必要参数' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const apiKey = context.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          reply: 'AI 老师暂时不在线。请在 Cloudflare 后台设置 ANTHROPIC_API_KEY 环境变量。',
        }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    const anthropic = new Anthropic({ apiKey })

    const messages: Anthropic.MessageParam[] = [
      ...(history || []).map((m: any) => ({
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

    const textBlock = response.content.find((b: any) => b.type === 'text')
    const reply = textBlock?.text ?? '（AI 老师暂时无法回复，请重试）'
    return new Response(JSON.stringify({ reply }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('AI API error:', error?.message || error)
    return new Response(
      JSON.stringify({
        reply: '抱歉，AI 老师遇到了一点网络问题。请稍等片刻再试。',
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  }
}
