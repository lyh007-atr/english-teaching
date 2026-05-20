import express from 'express'
import cors from 'cors'
import { chatWithAI } from './ai'

const app = express()
const PORT = Number(process.env.PORT) || 3001

app.use(cors())
app.use(express.json())
app.set('trust proxy', 1)

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, lessonContext, apiKey } = req.body

    if (!message || !lessonContext) {
      return res.status(400).json({ error: '缺少必要参数' })
    }

    const reply = await chatWithAI(message, history || [], lessonContext, apiKey)
    res.json({ reply })
  } catch (error) {
    console.error('Chat error:', error)
    res.status(500).json({ error: 'AI 服务异常' })
  }
})

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`LAN access: http://<your-ip>:${PORT}`)
})
