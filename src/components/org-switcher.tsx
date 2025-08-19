'use client';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import Image from 'next/image';

export function OrgSwitcher() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size='lg'
          className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
        >
          <div className='flex aspect-square size-10 items-center justify-center overflow-hidden rounded-lg'>
            <Image src='/LOGO_DCX.png' alt='Logo' width={44} height={44} />
          </div>
          <div className='flex flex-col gap-0.5 leading-none'>
            <span className='font-semibold'>G-PSF Admin</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
