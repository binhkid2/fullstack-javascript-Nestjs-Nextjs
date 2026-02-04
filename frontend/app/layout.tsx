import type { ReactNode } from 'react';
import './globals.css';
import Providers from './providers';

export const metadata = {
  title: 'Magic Link Auth',
  description: 'Simple Next.js app with magic link login',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
