'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import { formatCurrency, truncateAddress } from '@/lib/utils'
import { ExternalLink, Minus, Plus, RefreshCw } from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'

export function RecentActivity() {
  const { publicKey } = useWallet()

  const { data: activities, isLoading } = useQuery({
    queryKey: ['recent-activity', publicKey?.toString()],
    queryFn: async () => {
      return [
        {
          id: '1',
          type: 'rebalance',
          description: 'Rebalanced SOL/USDC position',
          amount: 1250.5,
          timestamp: new Date(Date.now() - 3600000),
          signature: '5KZwP7jQxH2Gk3V...',
          status: 'confirmed'
        },
        {
          id: '2',
          type: 'add_liquidity',
          description: 'Added liquidity to RAY/SOL',
          amount: 2100.75,
          timestamp: new Date(Date.now() - 7200000),
          signature: '7HGd2q9Lm3Vs8A...',
          status: 'confirmed'
        },
        {
          id: '3',
          type: 'fees_claimed',
          description: 'Claimed fees from BONK/SOL',
          amount: 45.25,
          timestamp: new Date(Date.now() - 10800000),
          signature: '9KLm1Ns0Qa7XeZ...',
          status: 'confirmed'
        }
      ]
    },
    enabled: !!publicKey,
    refetchInterval: 30000
  })

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'rebalance':
        return <RefreshCw className="h-4 w-4 text-blue-600" />
      case 'add_liquidity':
        return <Plus className="h-4 w-4 text-green-600" />
      case 'remove_liquidity':
        return <Minus className="h-4 w-4 text-red-600" />
      case 'fees_claimed':
        return <ExternalLink className="h-4 w-4 text-purple-600" />
      default:
        return <ExternalLink className="h-4 w-4 text-gray-600" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'rebalance':
        return 'text-blue-600'
      case 'add_liquidity':
        return 'text-green-600'
      case 'remove_liquidity':
        return 'text-red-600'
      case 'fees_claimed':
        return 'text-purple-600'
      default:
        return 'text-gray-600'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="h-8 w-8 bg-gray-300 rounded-full" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4" />
                  <div className="h-3 bg-gray-300 rounded w-1/2" />
                </div>
                <div className="h-4 bg-gray-300 rounded w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities?.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-3">
              <div className="flex-shrink-0">{getActivityIcon(activity.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{activity.description}</p>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>{activity.timestamp.toLocaleTimeString()}</span>
                  <span>•</span>
                  <span>{truncateAddress(activity.signature)}</span>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${getActivityColor(activity.type)}`}>
                  {activity.type === 'fees_claimed' || activity.type === 'add_liquidity' ? '+' : ''}
                  {formatCurrency(activity.amount)}
                </p>
                <p className="text-xs text-gray-500 capitalize">{activity.status}</p>
              </div>
            </div>
          ))}
          {!activities?.length && (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500">No recent activity</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


