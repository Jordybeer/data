import type { Metadata, Viewport } from 'next';
import { SessionProvider } from '@/components/SessionProvider';
import OfflineBanner from '@/components/OfflineBanner';
import './globals.css';

export const metadata: Metadata = {
  title: 'Psychonaut DB',
  description: 'Personal psychoactive substances database',
};

export const viewport: Viewport = {
  themeColor: '#6366f1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body>
        <SessionProvider>
          <OfflineBanner />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
