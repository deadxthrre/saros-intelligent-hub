import { RebalanceStrategy } from '@/types'

export class BacktestingService {
  async runBacktest(
    strategy: RebalanceStrategy,
    historicalData: BacktestData[],
    initialCapital: number,
    startDate: Date,
    endDate: Date
  ): Promise<BacktestResult> {
    const filteredData = historicalData
      .filter((d) => d.timestamp >= startDate && d.timestamp <= endDate)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

    if (filteredData.length === 0) {
      throw new Error('No historical data available for the specified period')
    }

    let portfolio = this.initializePortfolio(initialCapital, filteredData[0])
    const results: BacktestStep[] = []
    let totalRebalances = 0
    let totalGasCost = 0

    for (let i = 1; i < filteredData.length; i++) {
      const currentData = filteredData[i]
      const previousData = filteredData[i - 1]

      portfolio = this.updatePortfolioValue(portfolio, currentData, previousData)
      const shouldRebalance = this.shouldRebalance(portfolio, currentData, strategy)

      if (shouldRebalance) {
        const rebalanceResult = this.executeRebalance(portfolio, currentData, strategy)
        portfolio = rebalanceResult.newPortfolio
        totalRebalances++
        totalGasCost += rebalanceResult.gasCost
      }

      portfolio.feesEarned += this.calculateFeesEarned(portfolio, currentData, previousData)

      results.push({
        timestamp: currentData.timestamp,
        portfolioValue: portfolio.totalValue,
        pnl: portfolio.totalValue - initialCapital,
        feesEarned: portfolio.feesEarned,
        rebalanceExecuted: shouldRebalance,
        gasCost: shouldRebalance ? this.estimateGasCost(strategy) : 0
      })
    }

    const finalResult = results[results.length - 1]
    const totalReturn = ((finalResult.portfolioValue - initialCapital) / initialCapital) * 100
    const maxDrawdown = this.calculateMaxDrawdown(results)
    const sharpeRatio = this.calculateSharpeRatio(results)
    const winRate = this.calculateWinRate(results)

    return {
      strategy,
      initialCapital,
      finalValue: finalResult.portfolioValue,
      totalReturn,
      totalPnl: finalResult.pnl,
      totalFeesEarned: finalResult.feesEarned,
      totalGasCost,
      totalRebalances,
      maxDrawdown,
      sharpeRatio,
      winRate,
      duration: {
        start: startDate,
        end: endDate,
        days: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      },
      steps: results,
      metrics: this.calculateDetailedMetrics(results),
      comparison: await this.generateComparison(results, historicalData, initialCapital)
    }
  }

  async runMultipleBacktests(
    strategies: RebalanceStrategy[],
    historicalData: BacktestData[],
    initialCapital: number,
    startDate: Date,
    endDate: Date
  ): Promise<MultiBacktestResult> {
    const results = await Promise.all(
      strategies.map((strategy) =>
        this.runBacktest(strategy, historicalData, initialCapital, startDate, endDate)
      )
    )

    const sortedByReturn = [...results].sort((a, b) => b.totalReturn - a.totalReturn)
    const sortedBySharpe = [...results].sort((a, b) => b.sharpeRatio - a.sharpeRatio)

    return {
      results,
      bestByReturn: sortedByReturn[0],
      bestBySharpe: sortedBySharpe[0],
      summary: {
        averageReturn: results.reduce((sum, r) => sum + r.totalReturn, 0) / results.length,
        averageSharpe: results.reduce((sum, r) => sum + r.sharpeRatio, 0) / results.length,
        averageMaxDrawdown: results.reduce((sum, r) => sum + r.maxDrawdown, 0) / results.length,
        totalStrategiesTested: results.length
      }
    }
  }

  private initializePortfolio(initialCapital: number, initialData: BacktestData): BacktestPortfolio {
    return {
      totalValue: initialCapital,
      cash: initialCapital * 0.1,
      positions: [
        {
          tokenX: { amount: initialCapital * 0.45, symbol: 'SOL' },
          tokenY: { amount: initialCapital * 0.45, symbol: 'USDC' },
          value: initialCapital * 0.9
        }
      ],
      feesEarned: 0,
      lastRebalance: initialData.timestamp
    }
  }

  private updatePortfolioValue(
    portfolio: BacktestPortfolio,
    currentData: BacktestData,
    previousData: BacktestData
  ): BacktestPortfolio {
    const priceChangeX = (currentData.tokenXPrice - previousData.tokenXPrice) / previousData.tokenXPrice
    const priceChangeY = (currentData.tokenYPrice - previousData.tokenYPrice) / previousData.tokenYPrice

    const updatedPositions = portfolio.positions.map((position) => {
      const newXValue = position.tokenX.amount * (1 + priceChangeX)
      const newYValue = position.tokenY.amount * (1 + priceChangeY)
      return { ...position, value: newXValue + newYValue }
    })

    const totalPositionValue = updatedPositions.reduce((sum, pos) => sum + pos.value, 0)

    return { ...portfolio, positions: updatedPositions, totalValue: totalPositionValue + portfolio.cash }
  }

  private shouldRebalance(
    portfolio: BacktestPortfolio,
    currentData: BacktestData,
    strategy: RebalanceStrategy
  ): boolean {
    const timeSinceLastRebalance = currentData.timestamp.getTime() - portfolio.lastRebalance.getTime()
    const minutesSince = timeSinceLastRebalance / (1000 * 60)
    const timeInterval = strategy.parameters?.timeInterval ?? 60
    const priceDeviation = strategy.parameters?.priceDeviation ?? 5
    if (minutesSince < timeInterval) return false
    const position = portfolio.positions[0]
    if (!position) return false
    const currentXWeight = position.tokenX.amount / position.value
    const targetWeight = 0.5
    const deviation = Math.abs(currentXWeight - targetWeight) * 100
    return deviation > priceDeviation
  }

  private executeRebalance(
    portfolio: BacktestPortfolio,
    currentData: BacktestData,
    strategy: RebalanceStrategy
  ): { newPortfolio: BacktestPortfolio; gasCost: number } {
    const gasCost = this.estimateGasCost(strategy)
    const position = portfolio.positions[0]
    if (!position) return { newPortfolio: portfolio, gasCost: 0 }
    const totalPositionValue = position.value - gasCost
    const targetXValue = totalPositionValue * 0.5
    const targetYValue = totalPositionValue * 0.5
    const newPortfolio: BacktestPortfolio = {
      ...portfolio,
      positions: [
        {
          tokenX: { amount: targetXValue, symbol: position.tokenX.symbol },
          tokenY: { amount: targetYValue, symbol: position.tokenY.symbol },
          value: totalPositionValue
        }
      ],
      cash: portfolio.cash - gasCost,
      totalValue: portfolio.totalValue - gasCost,
      lastRebalance: currentData.timestamp
    }
    return { newPortfolio, gasCost }
  }

  private calculateFeesEarned(
    portfolio: BacktestPortfolio,
    currentData: BacktestData,
    previousData: BacktestData
  ): number {
    void previousData
    const position = portfolio.positions[0]
    if (!position) return 0
    const volume = currentData.volume || 1000000
    const tvl = currentData.tvl || 10000000
    const positionShare = position.value / tvl
    const feeRate = 0.003
    return volume * positionShare * feeRate * (1 / 365)
  }

  private estimateGasCost(strategy: RebalanceStrategy): number {
    const maxGasSpend = strategy.parameters?.maxGasSpend ?? 0.1
    return Math.min(maxGasSpend * 0.8, 0.01)
  }

  private calculateMaxDrawdown(steps: BacktestStep[]): number {
    let maxDrawdown = 0
    let peak = steps[0]?.portfolioValue || 0
    for (const step of steps) {
      if (step.portfolioValue > peak) {
        peak = step.portfolioValue
      } else {
        const drawdown = (peak - step.portfolioValue) / peak
        maxDrawdown = Math.max(maxDrawdown, drawdown)
      }
    }
    return maxDrawdown * 100
  }

  private calculateSharpeRatio(steps: BacktestStep[]): number {
    if (steps.length < 2) return 0
    const returns: number[] = []
    for (let i = 1; i < steps.length; i++) {
      const returnRate = (steps[i].portfolioValue - steps[i - 1].portfolioValue) / steps[i - 1].portfolioValue
      returns.push(returnRate)
    }
    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length
    const stdDev = Math.sqrt(variance)
    const riskFreeRate = 0.02 / 365
    return stdDev === 0 ? 0 : (meanReturn - riskFreeRate) / stdDev
  }

  private calculateWinRate(steps: BacktestStep[]): number {
    if (steps.length < 2) return 0
    let winningDays = 0
    let totalDays = 0
    for (let i = 1; i < steps.length; i++) {
      const dailyReturn = steps[i].portfolioValue - steps[i - 1].portfolioValue
      if (dailyReturn > 0) winningDays++
      totalDays++
    }
    return totalDays === 0 ? 0 : (winningDays / totalDays) * 100
  }

  private calculateDetailedMetrics(steps: BacktestStep[]): BacktestMetrics {
    const returns: number[] = []
    for (let i = 1; i < steps.length; i++) {
      returns.push((steps[i].portfolioValue - steps[i - 1].portfolioValue) / steps[i - 1].portfolioValue)
    }
    const totalFees = steps[steps.length - 1]?.feesEarned || 0
    const totalGas = steps.reduce((sum, step) => sum + step.gasCost, 0)
    const rebalanceCount = steps.filter((step) => step.rebalanceExecuted).length
    return {
      avgDailyReturn: (returns.reduce((sum, r) => sum + r, 0) / (returns.length || 1)) * 100,
      volatility: Math.sqrt(returns.reduce((sum, r) => sum + r * r, 0) / (returns.length || 1)) * Math.sqrt(365) * 100,
      totalFees,
      totalGasCost: totalGas,
      rebalanceCount,
      profitFactor: this.calculateProfitFactor(returns),
      recoveryFactor: this.calculateRecoveryFactor(steps),
      calmarRatio: this.calculateCalmarRatio(returns, this.calculateMaxDrawdown(steps))
    }
  }

  private calculateProfitFactor(returns: number[]): number {
    const profits = returns.filter((r) => r > 0).reduce((sum, r) => sum + r, 0)
    const losses = Math.abs(returns.filter((r) => r < 0).reduce((sum, r) => sum + r, 0))
    return losses === 0 ? (profits > 0 ? Infinity : 0) : profits / losses
  }

  private calculateRecoveryFactor(steps: BacktestStep[]): number {
    const totalReturn =
      steps.length > 0
        ? ((steps[steps.length - 1].portfolioValue - steps[0].portfolioValue) / steps[0].portfolioValue) * 100
        : 0
    const maxDrawdown = this.calculateMaxDrawdown(steps)
    return maxDrawdown === 0 ? (totalReturn > 0 ? Infinity : 0) : totalReturn / maxDrawdown
  }

  private calculateCalmarRatio(returns: number[], maxDrawdown: number): number {
    const avg = returns.length > 0 ? returns.reduce((sum, r) => sum + r, 0) / returns.length : 0
    const annualizedReturn = avg * 365 * 100
    return maxDrawdown === 0 ? (annualizedReturn > 0 ? Infinity : 0) : annualizedReturn / maxDrawdown
  }

  private async generateComparison(
    results: BacktestStep[],
    historicalData: BacktestData[],
    initialCapital: number
  ): Promise<BacktestComparison> {
    const buyAndHoldReturn = this.calculateBuyAndHoldReturn(historicalData, initialCapital)
    const strategyReturn =
      results.length > 0 ? ((results[results.length - 1].portfolioValue - initialCapital) / initialCapital) * 100 : 0
    return {
      vsHodl: {
        strategyReturn,
        hodlReturn: buyAndHoldReturn,
        outperformance: strategyReturn - buyAndHoldReturn
      },
      riskAdjusted: {
        strategySharpe: this.calculateSharpeRatio(results),
        strategyMaxDrawdown: this.calculateMaxDrawdown(results),
        hodlMaxDrawdown: this.calculateHodlMaxDrawdown(historicalData)
      }
    }
  }

  private calculateBuyAndHoldReturn(historicalData: BacktestData[], initialCapital: number): number {
    if (historicalData.length < 2) return 0
    const initial = historicalData[0]
    const final = historicalData[historicalData.length - 1]
    const initialXAmount = (initialCapital * 0.5) / initial.tokenXPrice
    const initialYAmount = (initialCapital * 0.5) / initial.tokenYPrice
    const finalValue = initialXAmount * final.tokenXPrice + initialYAmount * final.tokenYPrice
    return ((finalValue - initialCapital) / initialCapital) * 100
  }

  private calculateHodlMaxDrawdown(historicalData: BacktestData[]): number {
    const values = historicalData.map((d) => d.tokenXPrice + d.tokenYPrice)
    let maxDrawdown = 0
    let peak = values[0] || 0
    for (const value of values) {
      if (value > peak) {
        peak = value
      } else {
        const drawdown = (peak - value) / peak
        maxDrawdown = Math.max(maxDrawdown, drawdown)
      }
    }
    return maxDrawdown * 100
  }
}

export interface BacktestData {
  timestamp: Date
  tokenXPrice: number
  tokenYPrice: number
  volume?: number
  tvl?: number
}

export interface BacktestPortfolio {
  totalValue: number
  cash: number
  positions: BacktestPosition[]
  feesEarned: number
  lastRebalance: Date
}

export interface BacktestPosition {
  tokenX: { amount: number; symbol: string }
  tokenY: { amount: number; symbol: string }
  value: number
}

export interface BacktestStep {
  timestamp: Date
  portfolioValue: number
  pnl: number
  feesEarned: number
  rebalanceExecuted: boolean
  gasCost: number
}

export interface BacktestResult {
  strategy: RebalanceStrategy
  initialCapital: number
  finalValue: number
  totalReturn: number
  totalPnl: number
  totalFeesEarned: number
  totalGasCost: number
  totalRebalances: number
  maxDrawdown: number
  sharpeRatio: number
  winRate: number
  duration: { start: Date; end: Date; days: number }
  steps: BacktestStep[]
  metrics: BacktestMetrics
  comparison: BacktestComparison
}

export interface BacktestMetrics {
  avgDailyReturn: number
  volatility: number
  totalFees: number
  totalGasCost: number
  rebalanceCount: number
  profitFactor: number
  recoveryFactor: number
  calmarRatio: number
}

export interface BacktestComparison {
  vsHodl: { strategyReturn: number; hodlReturn: number; outperformance: number }
  riskAdjusted: { strategySharpe: number; strategyMaxDrawdown: number; hodlMaxDrawdown: number }
}

export interface MultiBacktestResult {
  results: BacktestResult[]
  bestByReturn: BacktestResult
  bestBySharpe: BacktestResult
  summary: {
    averageReturn: number
    averageSharpe: number
    averageMaxDrawdown: number
    totalStrategiesTested: number
  }
}

export const backtestingService = new BacktestingService()


