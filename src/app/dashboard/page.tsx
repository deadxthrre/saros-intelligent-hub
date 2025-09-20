'use client'
import { PortfolioSummary } from '@/components/dashboard/PortfolioSummary'

export default function DashboardPage() {
  return (
    <main className="min-h-screen container mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Dashboard</h2>
      <PortfolioSummary />
    </main>
  )
}


