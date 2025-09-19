import { Telegraf, Markup, Context } from 'telegraf'
import { formatCurrency, formatNumber } from '../utils/helpers'

interface BotSession {
  walletAddress?: string
  step?: string
}

interface BotContext extends Context {
  session?: BotSession
}

export class TelegramBotService {
  private bot: Telegraf<BotContext>

  constructor() {
    const token = process.env.TELEGRAM_BOT_TOKEN
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN is not set')
    }
    this.bot = new Telegraf<BotContext>(token)
    this.setupCommands()
    this.setupCallbacks()
  }

  private setupCommands() {
    this.bot.command('start', async (ctx) => {
      const welcomeMessage = `
🚀 Welcome to Sarocore Bot!

I'll help you manage your DLMM positions on the go.

Available Commands:
/portfolio - View your portfolio summary
/positions - List all your positions
/alerts - Manage price alerts
/rebalance - Check rebalancing opportunities
/settings - Bot settings
/help - Show this help message

First, let's connect your wallet:
      `
      await ctx.reply(welcomeMessage, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([[Markup.button.callback('🔗 Connect Wallet', 'connect_wallet')]])
      })
    })

    this.bot.command('help', async (ctx) => {
      await ctx.reply('Use /portfolio, /positions, /rebalance, /alerts, /settings to interact with Sarocore Bot.')
    })
  }

  private setupCallbacks() {
    this.bot.action('connect_wallet', async (ctx) => {
      const authUrl = `${process.env.WEBAPP_URL || 'https://saros-intelligence.vercel.app'}/auth/telegram?user_id=${ctx.from?.id}`
      await ctx.reply('Click below to connect your wallet securely:', {
        ...Markup.inlineKeyboard([[Markup.button.url('🔗 Connect Wallet', authUrl)]])
      })
    })
  }

  async start() {
    await this.bot.launch()
    console.log('✅ Sarocore Bot started')
  }

  stop(signal: string) {
    this.bot.stop(signal)
  }
}

export const telegramBotService = new TelegramBotService()
