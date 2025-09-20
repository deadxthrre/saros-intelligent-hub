export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-4xl font-bold text-gray-900">🚀 Saros Intelligence Hub</h1>
        <p className="text-xl text-gray-600">Advanced DLMM Portfolio Management</p>
        <p className="text-sm text-gray-500">Phase 6 Complete: Telegram Bot + Dashboard</p>
        <div className="space-x-4">
          <a href="/dashboard" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            View Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}



