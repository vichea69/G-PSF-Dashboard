'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import {
  IconEdit,
  IconMail,
  IconShieldLock,
  IconUser
} from '@tabler/icons-react';
import * as React from 'react';
import { useAuthUser } from '@/hooks/use-auth-user';
import {
  getUserFromLocalStorage,
  type AuthClientUser
} from '@/lib/auth-client';

export default function ProfileViewPage() {
  const sidebarUser = useAuthUser();
  const [rawUser, setRawUser] = React.useState<AuthClientUser | null>(null);

  React.useEffect(() => {
    const sync = () => setRawUser(getUserFromLocalStorage());
    sync();
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

  const username = rawUser?.username ?? sidebarUser?.fullName ?? '';
  const email =
    rawUser?.email ?? sidebarUser?.emailAddresses?.[0]?.emailAddress ?? '';
  const role = rawUser?.role ?? 'user';

  return (
    <div className='flex w-full flex-col gap-6 p-4'>
      <div className='flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
        <div className='flex items-center gap-3'>
          <UserAvatarProfile
            className='h-14 w-14 rounded-lg'
            showInfo
            user={sidebarUser}
          />
          <Badge variant='secondary' className='ml-1 capitalize'>
            {role}
          </Badge>
        </div>
        <div className='flex items-center gap-2'>
          <Button size='sm' variant='outline'>
            <IconEdit className='mr-2 h-4 w-4' /> Edit Profile
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'>
        <Card className='xl:col-span-2'>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center gap-3'>
                <div className='bg-muted text-muted-foreground flex h-9 w-9 items-center justify-center rounded-md'>
                  <IconUser className='h-4 w-4' />
                </div>
                <div className='flex-1'>
                  <div className='text-sm font-medium'>Username</div>
                  <div className='text-muted-foreground text-sm'>
                    {username}
                  </div>
                </div>
              </div>
              <Separator />
              <div className='flex items-center gap-3'>
                <div className='bg-muted text-muted-foreground flex h-9 w-9 items-center justify-center rounded-md'>
                  <IconMail className='h-4 w-4' />
                </div>
                <div className='flex-1'>
                  <div className='text-sm font-medium'>Email</div>
                  <div className='text-muted-foreground text-sm'>{email}</div>
                </div>
              </div>
              <Separator />
              <div className='flex items-center gap-3'>
                <div className='bg-muted text-muted-foreground flex h-9 w-9 items-center justify-center rounded-md'>
                  <IconShieldLock className='h-4 w-4' />
                </div>
                <div className='flex-1'>
                  <div className='text-sm font-medium'>Role</div>
                  <div className='text-muted-foreground text-sm capitalize'>
                    {role}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <div className='text-muted-foreground text-sm'>
                Manage your account security.
              </div>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-sm font-medium'>Password</div>
                  <div className='text-muted-foreground text-xs'>
                    Last updated recently
                  </div>
                </div>
                <Button size='sm' variant='outline'>
                  Change
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
