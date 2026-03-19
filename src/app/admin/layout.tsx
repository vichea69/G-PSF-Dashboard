import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { PermissionProvider } from '@/context/permission-context';
import { getAdminAccess } from '@/lib/admin-access';
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
  // Load the current user's permissions once at the admin layout level
  // so every nested page and client component can reuse the same access data.
  const access = await getAdminAccess();
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <LanguageProvider>
        <PermissionProvider user={access.user} permissions={access.permissions}>
          <KBar>
            <AppSidebar />
            <SidebarInset>
              <Header />
              {children}
            </SidebarInset>
          </KBar>
        </PermissionProvider>
      </LanguageProvider>
    </SidebarProvider>
  );
}
