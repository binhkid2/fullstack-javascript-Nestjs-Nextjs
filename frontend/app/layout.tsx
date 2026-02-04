import type { ReactNode } from 'react';
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import Providers from './providers';
import { ToastContainer } from 'react-toastify';

export const metadata = {
  title: 'Magic Link Auth',
  description: 'Simple Next.js app with magic link login',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <Providers>{children}</Providers>
        <ToastContainer position="top-right" autoClose={4000} />
      </body>
    </html>
  );
}
