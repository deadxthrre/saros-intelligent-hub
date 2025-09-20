export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor your DLMM positions and portfolio performance</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Total Value</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">$15,750.00</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">P&L</h3>
            <p className="text-2xl font-bold text-green-600 mt-2">+$510.00</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Fees Earned</h3>
            <p className="text-2xl font-bold text-green-600 mt-2">$215.00</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Positions</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">3</p>
          </div>
        </div>
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Status</h2>
          <div className="space-y-2 text-sm">
            <p>✅ Phase 6 Complete: Telegram Bot Infrastructure</p>
            <p>✅ Backend Running: Health checks passing</p>
            <p>✅ DLMM Service: Mock data working</p>
            <p>🔄 Next: Phase 7 - Analytics Engine</p>
          </div>
        </div>
      </div>
    </div>
  )
}


