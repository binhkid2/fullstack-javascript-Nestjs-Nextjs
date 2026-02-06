import type { ReactNode } from 'react';
import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import Providers from './providers';
import { ToastContainer } from 'react-toastify';
import SiteShell from './components/SiteShell';

export const metadata = {
  title: "Duc Binh 's blog",
  description: ' Nestjs + Next.js blogs app',
  openGraph: {
    title: "Duc Binh 's blog",
    description: ' Nestjs + Next.js blogs app',
    images: [
      'https://logos-world.net/wp-content/uploads/2021/08/Blogger-Logo-2010-2013.png',
    ],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <Providers>
          <SiteShell>{children}</SiteShell>
        </Providers>
        <ToastContainer position="top-right" autoClose={4000} />
      </body>
    </html>
  );
}
