'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, Bot, Plus, RefreshCw, Settings, Zap } from 'lucide-react'
import Link from 'next/link'

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Link href="/positions/add" className="block">
          <Button className="w-full justify-start" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Position
          </Button>
        </Link>
        <Link href="/strategies" className="block">
          <Button className="w-full justify-start" variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Create Strategy
          </Button>
        </Link>
        <Link href="/analytics" className="block">
          <Button className="w-full justify-start" variant="outline">
            <BarChart3 className="mr-2 h-4 w-4" />
            View Analytics
          </Button>
        </Link>
        <Button className="w-full justify-start" variant="outline">
          <Zap className="mr-2 h-4 w-4" />
          Auto-Rebalance
        </Button>
        <Link href="/telegram" className="block">
          <Button className="w-full justify-start" variant="outline">
            <Bot className="mr-2 h-4 w-4" />
            Telegram Bot
          </Button>
        </Link>
        <Link href="/settings" className="block">
          <Button className="w-full justify-start" variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}


