import type { Metadata } from 'next';
import { SessionProvider } from '@/components/SessionProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Psychonaut DB',
  description: 'Personal psychoactive substances database',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
