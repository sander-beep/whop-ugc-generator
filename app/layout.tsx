import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { WhopApp } from '@whop/react/components';
import { AuthProvider } from '@/components/AuthProvider'
import { Header } from '@/components/Header'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Whop AI UGC Ad Generator',
  description: 'Generate AI-powered UGC video ads',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <WhopApp>
          <AuthProvider>
            <Header />
            {children}
            <Toaster />
          </AuthProvider>
        </WhopApp>
      </body>
    </html>
  );
}
