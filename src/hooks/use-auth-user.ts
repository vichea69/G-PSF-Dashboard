import * as React from 'react';
import { getUserFromLocalStorage } from '@/services/auth.service';

export type SidebarUser = {
  imageUrl?: string;
  fullName?: string | null;
  emailAddresses: Array<{ emailAddress: string }>;
} | null;

function normalizeUser(u: any): SidebarUser {
  if (!u) return null;
  return {
    imageUrl: u.image ?? '',
    fullName: u.username ?? u.email?.split('@')[0] ?? '',
    emailAddresses: [{ emailAddress: u.email }]
  };
}

export function useAuthUser(): SidebarUser {
  const [user, setUser] = React.useState<SidebarUser>(null);

  React.useEffect(() => {
    const sync = () => setUser(normalizeUser(getUserFromLocalStorage()));
    // initial
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

  return user;
}
