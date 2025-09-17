'use client';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import Image from 'next/image';
import Link from 'next/link';

export function OrgSwitcher() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size='lg'
          className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
        >
          <Link href='/admin/overview'>
            <div className='flex aspect-square size-10 items-center justify-center overflow-hidden rounded-lg'>
              <Image src='/LOGO_DCX.png' alt='Logo' width={44} height={44} />
            </div>
          </Link>
          <div className='flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden'>
            <span className='font-semibold'>G-PSF</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
