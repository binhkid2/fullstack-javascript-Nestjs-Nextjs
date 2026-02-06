'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

export default function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <>
      {isHome ? null : <SiteHeader />}
      {children}
      {isHome ? null : <SiteFooter />}
    </>
  );
}
