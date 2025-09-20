'use client'
import { useEffect, useMemo, useState } from 'react'
import { useDLMMPositions } from '@/hooks/useDLMMPositions'
import { analyticsService, type PortfolioAnalytics } from '@/services/analytics.service'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react'
import { WalletButton } from '@/components/wallet/WalletButton'

export function DashboardAnalytics() {
  const { data: positions, isLoading, error } = useDLMMPositions()
  const [analytics, setAnalytics] = useState<PortfolioAnalytics | null>(null)

  const hasWallet = useMemo(() => positions !== undefined || isLoading, [positions, isLoading])

  useEffect(() => {
    let mounted = true
    async function run() {
      if (positions && positions.length >= 0) {
        const result = await analyticsService.calculatePortfolioMetrics(positions)
        if (mounted) setAnalytics(result)
      }
    }
    run()
    return () => {
      mounted = false
    }
  }, [positions])

  if (!hasWallet) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connect Wallet</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-sm text-gray-600">Connect your Solana wallet to view analytics.</p>
          <WalletButton />
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-300 rounded w-24" />
              <div className="h-4 w-4 bg-gray-300 rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-300 rounded w-28 mb-2" />
              <div className="h-3 bg-gray-300 rounded w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">Error loading analytics</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(analytics?.totalValue || 0)}</div>
          <p className="text-xs text-muted-foreground">{analytics?.positionCount || 0} positions</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
          {((analytics?.totalPnl || 0) >= 0) ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${((analytics?.totalPnl || 0) >= 0) ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(analytics?.totalPnl || 0)}
          </div>
          <p className="text-xs text-muted-foreground">{(analytics?.totalPnlPercentage || 0).toFixed(2)}%</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Fees Earned</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(analytics?.totalFeesEarned || 0)}</div>
          <p className="text-xs text-muted-foreground">Fee yield {(analytics?.feeYield || 0).toFixed(2)}% APR</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Risk & Diversification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(analytics?.riskScore || 0)}/100</div>
          <p className="text-xs text-muted-foreground">Diversification {Math.round(analytics?.diversificationScore || 0)}/100</p>
        </CardContent>
      </Card>
    </div>
  )
}


