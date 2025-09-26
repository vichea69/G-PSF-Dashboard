import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { LanguageProvider } from '@/context/language-context';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'G-PSF Dashboard',
  description: 'G-PSF Dashboard'
};

export default async function DashboardLayout({
  children
}: {
  children: ReactNode;
}) {
  // Persisting the sidebar state in the cookie.
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';
  return (
    <KBar>
      <SidebarProvider defaultOpen={defaultOpen}>
        <LanguageProvider>
          <AppSidebar />
          <SidebarInset>
            <Header />
            {/* page main content */}
            {children}
            {/* page main content ends */}
          </SidebarInset>
        </LanguageProvider>
      </SidebarProvider>
    </KBar>
  );
}
