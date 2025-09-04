'use client';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import {
  IconLogout,
  IconUserCircle,
  IconChevronsDown,
  IconSettings
} from '@tabler/icons-react';
import { Skeleton } from '@/components/ui/skeleton';
import { logoutAction } from '@/server/action/userAuth/user';
import type { SidebarUser } from '@/hooks/use-auth-user';

export function SidebarFooterUserMenu({ user }: { user: SidebarUser }) {
  const router = useRouter();

  async function handleLogout() {
    // Clear client cache early for snappy UI
    try {
      localStorage.removeItem('current_user');
      window.dispatchEvent(new Event('auth:user'));
    } catch {}
    // Call server action which also redirects
    await logoutAction();
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              {user ? (
                <UserAvatarProfile
                  className='h-8 w-8 rounded-lg'
                  showInfo
                  user={user}
                />
              ) : (
                <div className='flex w-full items-center gap-2'>
                  <Skeleton className='h-8 w-8 rounded-lg' />
                  <div className='flex-1'>
                    <Skeleton className='mb-1 h-3 w-24' />
                    <Skeleton className='h-2 w-32' />
                  </div>
                </div>
              )}
              <IconChevronsDown className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            side='bottom'
            align='end'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='px-1 py-1.5'>
                {user ? (
                  <UserAvatarProfile
                    className='h-8 w-8 rounded-lg'
                    showInfo
                    user={user}
                  />
                ) : (
                  <div className='flex w-full items-center gap-2'>
                    <Skeleton className='h-8 w-8 rounded-lg' />
                    <div className='flex-1'>
                      <Skeleton className='mb-1 h-3 w-24' />
                      <Skeleton className='h-2 w-32' />
                    </div>
                  </div>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push('/admin/profile')}>
                <IconUserCircle className='mr-2 h-4 w-4' />
                Profile & Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <IconLogout className='mr-2 h-4 w-4' />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
