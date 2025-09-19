import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { telegramBotService } from './services/telegram.service'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(morgan('combined'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

async function startServer() {
  try {
    await telegramBotService.start()
    app.listen(PORT, () => {
      console.log(`🚀 Backend running on port ${PORT}`)
    })
  } catch (error) {
    console.error('❌ Failed to start backend:', error)
    process.exit(1)
  }
}

process.once('SIGINT', () => telegramBotService.stop('SIGINT'))
process.once('SIGTERM', () => telegramBotService.stop('SIGTERM'))

startServer()
