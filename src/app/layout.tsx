import './globals.css';
import type { Metadata } from 'next';
import { AppWalletProvider } from '@/components/wallet/WalletProvider';
import { Header } from '@/components/layout/Header';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

export const metadata: Metadata = {
  title: 'Saros Intelligence Hub',
  description: 'DLMM analytics and automation'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <QueryProvider>
            <AppWalletProvider>
              <Header />
              {children}
            </AppWalletProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}



