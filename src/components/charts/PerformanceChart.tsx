'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useAnalytics } from '@/hooks/useAnalytics'
import { formatCurrency } from '@/lib/utils'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { useState } from 'react'

const timeframes: { key: '24h' | '7d' | '30d' | '90d'; label: string }[] = [
  { key: '24h', label: '24H' },
  { key: '7d', label: '7D' },
  { key: '30d', label: '30D' },
  { key: '90d', label: '90D' }
]

export function PerformanceChart() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d' | '90d'>('7d')
  const { data } = useAnalytics(selectedTimeframe)

  const chartData = (data?.historical || []).map((point) => ({
    timestamp: point.timestamp instanceof Date ? point.timestamp : new Date(point.timestamp),
    value: point.portfolioValue
  }))

  const totalChange = chartData.length > 1 ? chartData[chartData.length - 1].value - chartData[0].value : 0
  const totalChangePercent = chartData.length > 1 && chartData[0].value > 0 ? (totalChange / chartData[0].value) * 100 : 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Portfolio Performance</CardTitle>
        <div className="flex space-x-1">
          {timeframes.map((timeframe) => (
            <button
              key={timeframe.key}
              onClick={() => setSelectedTimeframe(timeframe.key)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                selectedTimeframe === timeframe.key ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
              }`}
            >
              {timeframe.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <div className="flex items-center space-x-1">
            {totalChangePercent >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span className={`text-sm font-medium ${totalChangePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalChangePercent >= 0 ? '+' : ''}
              {totalChangePercent.toFixed(2)}%
            </span>
          </div>
          <span className="text-sm text-gray-500">({totalChange >= 0 ? '+' : ''}{formatCurrency(Math.abs(totalChange))})</span>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`} />
              <Tooltip
                formatter={(value: number, name: string) => [formatCurrency(value), name === 'value' ? 'Portfolio Value' : name]}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}


