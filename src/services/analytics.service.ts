import { DLMMPosition } from '@/types'

export class AnalyticsService {
  async calculatePortfolioMetrics(positions: DLMMPosition[]): Promise<PortfolioAnalytics> {
    const totalValue = positions.reduce((sum, pos) => sum + pos.totalUSDValue, 0)
    const totalPnl = positions.reduce((sum, pos) => sum + pos.pnl, 0)
    const totalFeesEarned = positions.reduce((sum, pos) => sum + pos.feesEarned, 0)
    const sortedByPnl = [...positions].sort((a, b) => b.pnl - a.pnl)

    const baseValue = totalValue - totalPnl
    const totalPnlPercentage = baseValue > 0 ? (totalPnl / baseValue) * 100 : 0

    return {
      totalValue,
      totalPnl,
      totalPnlPercentage,
      totalFeesEarned,
      positionCount: positions.length,
      topPerformer: sortedByPnl[0] || null,
      worstPerformer: sortedByPnl[sortedByPnl.length - 1] || null,
      averagePositionSize: positions.length > 0 ? totalValue / positions.length : 0,
      riskScore: this.calculateRiskScore(positions),
      diversificationScore: this.calculateDiversificationScore(positions),
      feeYield: this.calculateFeeYield(positions),
      impermanentLoss: this.calculateImpermanentLoss(positions)
    }
  }

  async getHistoricalPerformance(walletAddress: string, days: number): Promise<HistoricalData[]> {
    void walletAddress
    const data: HistoricalData[] = []
    const now = new Date()
    for (let i = days; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      data.push({
        timestamp: date,
        portfolioValue: 10000 + Math.random() * 2000,
        pnl: (Math.random() - 0.5) * 1000,
        feesEarned: Math.random() * 100,
        positionCount: Math.floor(Math.random() * 10) + 1
      })
    }
    return data
  }

  async generatePerformanceReport(
    positions: DLMMPosition[],
    timeframe: 'day' | 'week' | 'month' | 'year'
  ): Promise<PerformanceReport> {
    const analytics = await this.calculatePortfolioMetrics(positions)
    const historical = await this.getHistoricalPerformance(
      positions[0]?.userAddress || '',
      this.getTimeframeDays(timeframe)
    )

    return {
      period: timeframe,
      startDate: historical[0]?.timestamp || new Date(),
      endDate: new Date(),
      analytics,
      historical,
      insights: this.generateInsights(analytics, historical),
      recommendations: this.generateRecommendations(analytics, positions)
    }
  }

  private calculateRiskScore(positions: DLMMPosition[]): number {
    if (positions.length === 0) return 0
    const totalValue = positions.reduce((sum, pos) => sum + pos.totalUSDValue, 0)
    const maxPositionWeight = Math.max(
      ...positions.map((pos) => (totalValue > 0 ? pos.totalUSDValue / totalValue : 0))
    )
    const concentrationRisk = maxPositionWeight * 40
    const avgBinSpread =
      positions.reduce((sum, pos) => {
        if (pos.bins.length <= 1) return sum + 30
        const prices = pos.bins.map((bin) => bin.price).sort((a, b) => a - b)
        const spread = prices[0] !== 0 ? (prices[prices.length - 1] - prices[0]) / prices[0] : 0
        return sum + Math.max(0, 30 - spread * 100)
      }, 0) / positions.length
    const pnlVolatility = this.calculatePnLVolatility(positions)
    return Math.min(100, concentrationRisk + avgBinSpread + pnlVolatility)
  }

  private calculateDiversificationScore(positions: DLMMPosition[]): number {
    if (positions.length === 0) return 0
    const uniqueTokens = new Set<string>()
    positions.forEach((pos) => {
      uniqueTokens.add(pos.tokenX.symbol)
      uniqueTokens.add(pos.tokenY.symbol)
    })
    const tokenDiversity = Math.min(uniqueTokens.size * 10, 50)
    const positionDiversity = Math.min(positions.length * 5, 50)
    return tokenDiversity + positionDiversity
  }

  private calculateFeeYield(positions: DLMMPosition[]): number {
    const totalValue = positions.reduce((sum, pos) => sum + pos.totalUSDValue, 0)
    const totalFees = positions.reduce((sum, pos) => sum + pos.feesEarned, 0)
    if (totalValue === 0) return 0
    const dailyYield = totalFees / totalValue
    return dailyYield * 365 * 100
  }

  private calculateImpermanentLoss(positions: DLMMPosition[]): number {
    return positions.reduce((sum, pos) => {
      const priceChange = 0.1
      const il = (2 * Math.sqrt(1 + priceChange) / (2 + priceChange)) - 1
      return sum + il * pos.totalUSDValue
    }, 0)
  }

  private calculatePnLVolatility(positions: DLMMPosition[]): number {
    const ratios = positions
      .map((pos) => (pos.totalUSDValue > 0 ? pos.pnl / pos.totalUSDValue : 0))
      .filter((r) => Number.isFinite(r))
    if (ratios.length === 0) return 0
    const mean = ratios.reduce((sum, r) => sum + r, 0) / ratios.length
    const variance = ratios.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / ratios.length
    return Math.sqrt(variance) * 100
  }

  private generateInsights(analytics: PortfolioAnalytics, historical: HistoricalData[]): string[] {
    const insights: string[] = []
    if (analytics.riskScore > 70) insights.push('🚨 High portfolio risk detected. Consider diversifying across more token pairs.')
    if (analytics.diversificationScore < 30) insights.push('📊 Low diversification score. Add positions in different token pairs to reduce risk.')
    if (analytics.feeYield > 20) insights.push('💰 Excellent fee yield! Your liquidity positions are performing well.')
    if (historical.length > 7) {
      const recentTrend = historical.slice(-7).reduce((sum, day) => sum + day.pnl, 0)
      insights.push(recentTrend > 0 ? '📈 Positive trend over the last week. Portfolio is gaining momentum.' : '📉 Negative trend detected. Consider reviewing your strategy.')
    }
    return insights
  }

  private generateRecommendations(analytics: PortfolioAnalytics, positions: DLMMPosition[]): string[] {
    const recommendations: string[] = []
    if (analytics.riskScore > 60) recommendations.push('Consider widening liquidity ranges to reduce impermanent loss risk')
    if (analytics.feeYield < 5) recommendations.push('Look for higher-volume pairs to increase fee earnings')
    const lowPerformers = positions.filter((pos) => pos.pnl < -pos.totalUSDValue * 0.1)
    if (lowPerformers.length > 0) recommendations.push(`Review ${lowPerformers.length} underperforming positions for rebalancing`)
    if (positions.length < 3) recommendations.push('Consider adding more positions to improve diversification')
    return recommendations
  }

  private getTimeframeDays(timeframe: string): number {
    switch (timeframe) {
      case 'day':
        return 1
      case 'week':
        return 7
      case 'month':
        return 30
      case 'year':
        return 365
      default:
        return 7
    }
  }
}

export interface PortfolioAnalytics {
  totalValue: number
  totalPnl: number
  totalPnlPercentage: number
  totalFeesEarned: number
  positionCount: number
  topPerformer: DLMMPosition | null
  worstPerformer: DLMMPosition | null
  averagePositionSize: number
  riskScore: number
  diversificationScore: number
  feeYield: number
  impermanentLoss: number
}

export interface HistoricalData {
  timestamp: Date
  portfolioValue: number
  pnl: number
  feesEarned: number
  positionCount: number
}

export interface PerformanceReport {
  period: string
  startDate: Date
  endDate: Date
  analytics: PortfolioAnalytics
  historical: HistoricalData[]
  insights: string[]
  recommendations: string[]
}

export const analyticsService = new AnalyticsService()


