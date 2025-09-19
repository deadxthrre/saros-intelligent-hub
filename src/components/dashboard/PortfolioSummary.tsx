'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDLMMPositions } from '@/hooks/useDLMMPositions'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react'

export function PortfolioSummary() {
  const { data: positions, isLoading, error } = useDLMMPositions()

  if (isLoading) {
    return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 bg-gray-300 rounded w-20"></div>
            <div className="h-4 w-4 bg-gray-300 rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="h-8 bg-gray-300 rounded w-24 mb-1"></div>
            <div className="h-3 bg-gray-300 rounded w-16"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  }

  if (error) {
    return <div className="text-red-500">Error loading portfolio data</div>
  }

  const totalValue = positions?.reduce((sum, pos) => sum + pos.totalUSDValue, 0) || 0
  const totalPnl = positions?.reduce((sum, pos) => sum + pos.pnl, 0) || 0
  const totalFees = positions?.reduce((sum, pos) => sum + pos.feesEarned, 0) || 0
  const positionCount = positions?.length || 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
          {totalPnl >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(totalPnl)}
          </div>
          <p className="text-xs text-muted-foreground">
            {totalPnl >= 0 ? '+' : ''}{formatNumber((totalPnl / (totalValue - totalPnl)) * 100, 2)}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Fees Earned</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalFees)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Positions</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{positionCount}</div>
        </CardContent>
      </Card>
    </div>
  )
}
