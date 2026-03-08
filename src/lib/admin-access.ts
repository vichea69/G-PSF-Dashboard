import 'server-only';

import { cache } from 'react';
import { cookies } from 'next/headers';

import { baseAPI } from '@/lib/api';
import { normalizePermissions, type PermissionEntry } from '@/lib/permissions';

export type AdminAccess = {
  user: Record<string, unknown> | null;
  permissions: PermissionEntry[];
  isAuthenticated: boolean;
};

export const getAdminAccess = cache(async (): Promise<AdminAccess> => {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    return {
      user: null,
      permissions: [],
      isAuthenticated: false
    };
  }

  try {
    const response = await fetch(`${baseAPI}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      return {
        user: null,
        permissions: [],
        isAuthenticated: true
      };
    }

    const json = await response.json();
    const data = json?.data ?? {};
    const user = data?.user ?? null;
    // Backend currently nests permissions under `data.user.permissions`.
    // We still keep a fallback to `data.permissions` in case the API changes later.
    const permissionsSource = data?.permissions ?? user?.permissions ?? [];

    return {
      user,
      permissions: normalizePermissions(permissionsSource),
      isAuthenticated: true
    };
  } catch {
    return {
      user: null,
      permissions: [],
      isAuthenticated: true
    };
  }
});
