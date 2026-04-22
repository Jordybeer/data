import type { Metadata, Viewport } from 'next';
import { SessionProvider } from '@/components/SessionProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import OfflineBanner from '@/components/OfflineBanner';
import './globals.css';

export const metadata: Metadata = {
  title: 'Snuff DB',
  description: 'Personal psychoactive substances database',
};

export const viewport: Viewport = {
  themeColor: '#6366f1',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body>
        <ThemeProvider>
          <SessionProvider>
            <OfflineBanner />
            {children}
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
