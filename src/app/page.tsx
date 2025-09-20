export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Saros Intelligence Hub
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mt-6">
          Advanced portfolio management and analytics for Saros DLMM positions. Maximize your DeFi yields with intelligent automation.
        </p>
        <div className="flex gap-4 justify-center mt-10">
          <a href="/dashboard" className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Launch App
          </a>
          <a href="/analytics" className="inline-block px-8 py-3 border rounded-lg hover:bg-gray-50">
            View Analytics
          </a>
        </div>
      </div>
    </div>
  )
}



