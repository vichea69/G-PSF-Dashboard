'use client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { clearUserFromLocalStorage } from '@/lib/auth-client';
import { logoutAction } from '@/server/action/userAuth/user';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { IconLogout, IconUserCircle } from '@tabler/icons-react';
import { PaletteIcon } from 'lucide-react';
import { useAuthUser } from '@/hooks/use-auth-user';

export function UserNav() {
  const router = useRouter();
  const user = useAuthUser();

  async function handleLogout() {
    clearUserFromLocalStorage();
    await logoutAction();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='h-9 w-9 p-0'>
          <UserAvatarProfile className='h-8 w-8 rounded-lg' user={user} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='min-w-56 rounded-lg'
        side='bottom'
        align='end'
        sideOffset={6}
      >
        <DropdownMenuLabel className='p-0 font-normal'>
          <div className='px-1 py-1.5'>
            <UserAvatarProfile
              className='h-8 w-8 rounded-lg'
              showInfo
              user={user}
            />
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push('/admin/profile')}>
            <IconUserCircle className='mr-2 h-4 w-4' />
            Profile & Setting
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <PaletteIcon className='mr-2 h-4 w-4' />
          Theme colors
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <IconLogout className='mr-2 h-4 w-4' />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
