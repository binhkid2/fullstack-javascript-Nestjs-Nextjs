import type { ReactNode } from 'react';
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import Providers from './providers';
import { ToastContainer } from 'react-toastify';

export const metadata = {
  title: 'Duc Binh full stack javascript project',
  description: ' Nestjs + Next.js blogs app',
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
