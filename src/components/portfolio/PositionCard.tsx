'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DLMMPosition } from '@/types'
import { formatCurrency, truncateAddress } from '@/lib/utils'
import { ExternalLink, TrendingUp, TrendingDown } from 'lucide-react'
import Image from 'next/image'

interface PositionCardProps {
  position: DLMMPosition
  onClick?: () => void
}

export function PositionCard({ position, onClick }: PositionCardProps) {
  const isProfitable = position.pnl >= 0

  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-1">
            {position.tokenX.logoURI && (
              <Image
                src={position.tokenX.logoURI}
                alt={position.tokenX.symbol}
                width={20}
                height={20}
                className="rounded-full"
              />
            )}
            {position.tokenY.logoURI && (
              <Image
                src={position.tokenY.logoURI}
                alt={position.tokenY.symbol}
                width={20}
                height={20}
                className="rounded-full"
              />
            )}
          </div>
          <CardTitle className="text-sm font-medium">
            {position.tokenX.symbol}/{position.tokenY.symbol}
          </CardTitle>
        </div>
        <ExternalLink className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Total Value</span>
          <span className="font-medium">{formatCurrency(position.totalUSDValue)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">P&L</span>
          <div className="flex items-center space-x-1">
            {isProfitable ? (
              <TrendingUp className="h-3 w-3 text-green-600" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600" />
            )}
            <span className={`font-medium text-sm ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(position.pnl)}
            </span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Fees Earned</span>
          <span className="font-medium text-green-600">{formatCurrency(position.feesEarned)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Active Bins</span>
          <span className="font-medium">{position.bins.length}</span>
        </div>
        
        <div className="pt-2 border-t">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Pool:</span>
              <br />
              <span className="font-mono">{truncateAddress(position.poolAddress)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Active ID:</span>
              <br />
              <span className="font-mono">{position.activeId}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
