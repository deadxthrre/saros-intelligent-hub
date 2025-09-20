export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Monitor your DLMM positions and portfolio performance</p>
        </div>
        {/* Client analytics cards */}
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-expect-error server file calling client component factory */}
        {require('@/components/dashboard/DashboardAnalytics').DashboardAnalytics()}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-6">
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-expect-error server file calling client component factory */}
            {require('@/components/charts/PerformanceChart').PerformanceChart()}
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-expect-error server file calling client component factory */}
            {require('@/components/dashboard/RecentActivity').RecentActivity()}
          </div>
          <div className="space-y-6">
            {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
            {/* @ts-expect-error server file calling client component factory */}
            {require('@/components/dashboard/QuickActions').QuickActions()}
          </div>
        </div>
      </div>
    </div>
  )
}


