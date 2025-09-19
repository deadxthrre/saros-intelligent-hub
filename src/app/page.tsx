import { WalletButton } from '@/components/wallet/WalletButton'

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Saros Intelligence Hub</h1>
        <p className="text-gray-500 mt-2">Next.js app scaffolded (manual setup).</p>
        <div className="mt-6 flex justify-center">
          <WalletButton />
        </div>
      </div>
    </main>
  );
}



