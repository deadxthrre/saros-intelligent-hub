'use client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DLMMPosition } from '@/types'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface PositionModalProps {
  position: DLMMPosition | null
  isOpen: boolean
  onClose: () => void
}

export function PositionModal({ position, isOpen, onClose }: PositionModalProps) {
  if (!position) return null

  const binData = position.bins.map(bin => ({
    binId: bin.binId,
    price: bin.price,
    xAmount: bin.xAmount,
    yAmount: bin.yAmount,
    totalValue: bin.xAmount + bin.yAmount,
    userShare: bin.userShare
  }))

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {position.tokenX.symbol}/{position.tokenY.symbol} Position Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Position Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Value</p><p className="text-lg font-semibold">{formatCurrency(position.totalUSDValue)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">P&L</p>
              <p className={`text-lg font-semibold ${position.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(position.pnl)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Fees Earned</p>
              <p className="text-lg font-semibold text-green-600">{formatCurrency(position.feesEarned)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Active Bins</p>
              <p className="text-lg font-semibold">{position.bins.length}</p>
            </div>
          </div>

          {/* Token Breakdown */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">{position.tokenX.symbol} Holdings</h4>
              <p className="text-2xl font-bold">{formatNumber(position.totalXAmount, 6)}</p>
              <p className="text-sm text-muted-foreground">
                ~{formatCurrency(position.totalXAmount * 1)} {/* Price calculation needed */}
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">{position.tokenY.symbol} Holdings</h4>
              <p className="text-2xl font-bold">{formatNumber(position.totalYAmount, 6)}</p>
              <p className="text-sm text-muted-foreground">
                ~{formatCurrency(position.totalYAmount * 1)} {/* Price calculation needed */}
              </p>
            </div>
          </div>

          {/* Bin Distribution */}
          <div className="space-y-2">
            <h4 className="font-medium">Liquidity Distribution</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={binData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="binId" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [formatCurrency(Number(value)), name]}
                    labelFormatter={(label) => `Bin ID: ${label}`}
                  />
                  <Bar dataKey="totalValue" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bin Details */}
          <div className="space-y-2">
            <h4 className="font-medium">Bin Details</h4>
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 text-left">Bin ID</th>
                      <th className="p-2 text-left">Price</th>
                      <th className="p-2 text-left">{position.tokenX.symbol}</th>
                      <th className="p-2 text-left">{position.tokenY.symbol}</th>
                      <th className="p-2 text-left">Share %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {position.bins.map((bin, index) => (
                      <tr key={bin.binId} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/25'}>
                        <td className="p-2 font-mono">{bin.binId}</td>
                        <td className="p-2">{formatCurrency(bin.price)}</td>
                        <td className="p-2">{formatNumber(bin.xAmount, 6)}</td>
                        <td className="p-2">{formatNumber(bin.yAmount, 6)}</td>
                        <td className="p-2">{formatNumber(bin.userShare * 100, 2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
