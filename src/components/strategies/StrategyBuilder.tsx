'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { RebalanceStrategy, RebalanceParams } from '@/types'
import { Save, Play, Pause } from 'lucide-react'

interface StrategyBuilderProps {
  onSave: (strategy: RebalanceStrategy) => void
  existingStrategy?: RebalanceStrategy
}

export function StrategyBuilder({ onSave, existingStrategy }: StrategyBuilderProps) {
  const [strategy, setStrategy] = useState<Partial<RebalanceStrategy>>({
    name: existingStrategy?.name || '',
    description: existingStrategy?.description || '',
    parameters: existingStrategy?.parameters || {
      priceDeviation: 5,
      timeInterval: 60,
      slippageTolerance: 1,
      maxGasSpend: 0.1
    },
    isActive: existingStrategy?.isActive || false
  })

  const handleSave = () => {
    if (!strategy.name || !strategy.parameters) return
    
    const newStrategy: RebalanceStrategy = {
      id: existingStrategy?.id || Date.now().toString(),
      name: strategy.name,
      description: strategy.description || '',
      parameters: strategy.parameters,
      isActive: strategy.isActive || false,
      lastExecuted: existingStrategy?.lastExecuted
    }
    
    onSave(newStrategy)
  }

  const updateParameters = (key: keyof RebalanceParams, value: number) => {
    setStrategy(prev => ({
      ...prev,
      parameters: {
        ...prev.parameters!,
        [key]: value
      }
    }))
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Rebalancing Strategy Builder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Strategy Name</Label>
            <Input
              id="name"
              value={strategy.name}
              onChange={(e) => setStrategy(prev => ({ ...prev, name: e.target.value }))}
              placeholder="My Rebalancing Strategy"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={strategy.description}
              onChange={(e) => setStrategy(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Strategy description..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={!!strategy.isActive}
              onCheckedChange={(checked) => setStrategy(prev => ({ ...prev, isActive: checked }))}
            />
            <Label htmlFor="active">Active Strategy</Label>
          </div>
        </div>

        {/* Parameters */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Price Deviation Trigger: {strategy.parameters?.priceDeviation}%</Label>
            <Slider
              value={[strategy.parameters?.priceDeviation || 5]}
              onValueChange={([value]) => updateParameters('priceDeviation', value)}
              max={20}
              min={1}
              step={0.5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Rebalance when price moves more than this percentage from target
            </p>
          </div>

          <div className="space-y-2">
            <Label>Check Interval: {strategy.parameters?.timeInterval} minutes</Label>
            <Slider
              value={[strategy.parameters?.timeInterval || 60]}
              onValueChange={([value]) => updateParameters('timeInterval', value)}
              max={1440} // 24 hours
              min={5}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              How often to check for rebalancing opportunities
            </p>
          </div>

          <div className="space-y-2">
            <Label>Slippage Tolerance: {strategy.parameters?.slippageTolerance}%</Label>
            <Slider
              value={[strategy.parameters?.slippageTolerance || 1]}
              onValueChange={([value]) => updateParameters('slippageTolerance', value)}
              max={5}
              min={0.1}
              step={0.1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Maximum acceptable slippage for rebalancing trades
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxGas">Max Gas Spend (SOL)</Label>
            <Input
              id="maxGas"
              type="number"
              value={strategy.parameters?.maxGasSpend}
              onChange={(e) => updateParameters('maxGasSpend', parseFloat(e.target.value) || 0)}
              step={0.01}
              min={0}
            />
            <p className="text-xs text-muted-foreground">
              Maximum SOL to spend on gas fees per rebalance
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-4">
          <Button onClick={handleSave} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Save Strategy
          </Button>
          {strategy.isActive ? (
            <Button 
              variant="outline" 
              onClick={() => setStrategy(prev => ({ ...prev, isActive: false }))}
            >
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
          ) : (
            <Button 
              variant="outline"
              onClick={() => setStrategy(prev => ({ ...prev, isActive: true }))}
            >
              <Play className="w-4 h-4 mr-2" />
              Activate
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
