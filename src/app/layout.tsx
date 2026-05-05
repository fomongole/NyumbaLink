import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/components/shared/QueryProvider';
import { Toaster } from 'sonner';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NyumbaLink — Admin Dashboard',
  description: 'Property management dashboard for NyumbaLink Uganda',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} antialiased`}>
        <QueryProvider>
          {children}
          <Toaster position="top-right" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}