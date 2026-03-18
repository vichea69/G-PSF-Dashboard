'use client';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader
} from '@/components/ui/sidebar';
import { navItems } from '@/constants/data';
import { useMediaQuery } from '@/hooks/use-media-query';
import * as React from 'react';
import { OrgSwitcher } from '../org-switcher';
import { SidebarNavItems } from './nav-items-sidebar';

export default function AppSidebar() {
  const { isOpen } = useMediaQuery();

  React.useEffect(() => {
    // Side effects based on sidebar state changes
  }, [isOpen]);

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <OrgSwitcher />
      </SidebarHeader>
      <SidebarContent className='overflow-x-hidden'>
        <SidebarNavItems items={navItems} />
      </SidebarContent>
    </Sidebar>
  );
}
