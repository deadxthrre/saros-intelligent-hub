import './globals.css';
import type { Metadata } from 'next';
import { AppWalletProvider } from '@/components/wallet/WalletProvider';
import { Header } from '@/components/layout/Header';

export const metadata: Metadata = {
  title: 'Saros Intelligence Hub',
  description: 'DLMM analytics and automation'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppWalletProvider>
          <Header />
          {children}
        </AppWalletProvider>
      </body>
    </html>
  );
}



