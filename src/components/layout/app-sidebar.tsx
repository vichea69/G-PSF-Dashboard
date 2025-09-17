'use client';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from '@/components/ui/sidebar';
import { navItems } from '@/constants/data';
import { useMediaQuery } from '@/hooks/use-media-query';
import * as React from 'react';
import { OrgSwitcher } from '../org-switcher';
import { getUserFromLocalStorage } from '@/lib/auth-client';
import { SidebarFooterUserMenu } from '@/components/layout/sidebar-footer-user-menu';
import { SidebarNavItems } from './nav-items-sidebar';

export default function AppSidebar() {
  const { isOpen } = useMediaQuery();
  const [user, setUser] = React.useState<any | null>(null);

  React.useEffect(() => {
    // Side effects based on sidebar state changes
  }, [isOpen]);

  React.useEffect(() => {
    // hydrate user from localStorage on mount
    const u = getUserFromLocalStorage();
    if (u) {
      // Normalize fields for avatar component
      const normalized = {
        imageUrl: u.image ?? '',
        fullName: u.username ?? u.email?.split('@')[0] ?? '',
        emailAddresses: [{ emailAddress: u.email }]
      };
      setUser(normalized);
    }

    const sync = () => {
      const next = getUserFromLocalStorage();
      if (next) {
        const normalized = {
          imageUrl: next.image ?? '',
          fullName: next.username ?? next.email?.split('@')[0] ?? '',
          emailAddresses: [{ emailAddress: next.email }]
        };
        setUser(normalized);
      } else {
        setUser(null);
      }
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'current_user') sync();
    };
    const onAuthEvent = () => sync();
    window.addEventListener('storage', onStorage);
    window.addEventListener('auth:user', onAuthEvent as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('auth:user', onAuthEvent as EventListener);
    };
  }, []);

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <OrgSwitcher />
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        <SidebarNavItems items={navItems} />
      </SidebarContent>
      {/* <SidebarFooter>
        <SidebarFooterUserMenu user={user} />
      </SidebarFooter>
      <SidebarRail /> */}
    </Sidebar>
  );
}
