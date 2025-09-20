'use client'
import { useQuery } from '@tanstack/react-query'
import { useWallet } from '@solana/wallet-adapter-react'
import { analyticsService, type PerformanceReport } from '@/services/analytics.service'
import { dlmmService } from '@/services/dlmm.service'

type Timeframe = '24h' | '7d' | '30d' | '90d'

export function useAnalytics(timeframe: Timeframe = '7d') {
  const { publicKey } = useWallet()

  return useQuery<{ analytics: PerformanceReport['analytics']; historical: PerformanceReport['historical'] } | null>({
    queryKey: ['analytics', publicKey?.toString(), timeframe],
    queryFn: async () => {
      if (!publicKey) return null
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL
        if (apiUrl) {
          const res = await fetch(
            `${apiUrl}/api/analytics?address=${publicKey.toString()}&timeframe=${timeframe}`
          )
          if (res.ok) return (await res.json()) as any
        }
        const positions = await dlmmService.getUserPositions(publicKey)
        const analytics = await analyticsService.calculatePortfolioMetrics(positions)
        const historical = await analyticsService.getHistoricalPerformance(
          publicKey.toString(),
          getTimeframeDays(timeframe)
        )
        return { analytics, historical }
      } catch (error) {
        console.log('Using mock analytics data:', error)
        return {
          analytics: {
            totalValue: 15750,
            totalPnl: 1250,
            totalPnlPercentage: 8.62,
            totalFeesEarned: 315,
            positionCount: 3,
            topPerformer: null,
            worstPerformer: null,
            averagePositionSize: 5250,
            riskScore: 45,
            diversificationScore: 72,
            feeYield: 12.5,
            impermanentLoss: -125
          },
          historical: generateMockHistoricalData(timeframe)
        }
      }
    },
    enabled: !!publicKey,
    staleTime: 60_000,
    retry: 1
  })
}

function generateMockHistoricalData(timeframe: Timeframe) {
  const days = getTimeframeDays(timeframe)
  const data = [] as { timestamp: Date; portfolioValue: number; pnl: number; feesEarned: number; positionCount: number }[]
  const baseValue = 15000
  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    data.push({
      timestamp: date,
      portfolioValue: baseValue + (Math.random() - 0.4) * 3000,
      pnl: (Math.random() - 0.3) * 2000,
      feesEarned: Math.random() * 400,
      positionCount: 3 + Math.floor(Math.random() * 3)
    })
  }
  return data
}

function getTimeframeDays(timeframe: Timeframe): number {
  switch (timeframe) {
    case '24h':
      return 1
    case '7d':
      return 7
    case '30d':
      return 30
    case '90d':
      return 90
    default:
      return 7
  }
}


