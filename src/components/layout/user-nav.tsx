'use client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { getUserFromLocalStorage } from '@/lib/auth-client';
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
import {
  IconBell,
  IconCreditCard,
  IconLogout,
  IconUserCircle
} from '@tabler/icons-react';

export function UserNav() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [user, setUser] = React.useState<any | null>(null);

  React.useEffect(() => {
    const u = getUserFromLocalStorage();
    if (u) {
      setUser({
        imageUrl: u.image ?? '',
        fullName: u.username ?? u.email?.split('@')[0] ?? '',
        emailAddresses: [{ emailAddress: u.email }]
      });
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'current_user') {
        const next = getUserFromLocalStorage();
        if (next) {
          setUser({
            imageUrl: next.image ?? '',
            fullName: next.username ?? next.email?.split('@')[0] ?? '',
            emailAddresses: [{ emailAddress: next.email }]
          });
        } else {
          setUser(null);
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  async function handleLogout() {
    try {
      localStorage.removeItem('current_user');
      window.dispatchEvent(new Event('auth:user'));
    } catch {}
    await logoutAction();
  }

  if (!isMobile) return null;

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
          <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
            <IconUserCircle className='mr-2 h-4 w-4' />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <IconCreditCard className='mr-2 h-4 w-4' />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <IconBell className='mr-2 h-4 w-4' />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <IconLogout className='mr-2 h-4 w-4' />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
