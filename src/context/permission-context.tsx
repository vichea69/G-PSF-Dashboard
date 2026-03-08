'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';

import {
  canAccess,
  type PermissionAction,
  type PermissionEntry
} from '@/lib/permissions';

type PermissionUser = Record<string, unknown> | null;

type PermissionContextValue = {
  user: PermissionUser;
  permissions: PermissionEntry[];
  can: (resource: string, action: PermissionAction) => boolean;
};

const PermissionContext = createContext<PermissionContextValue | null>(null);

type PermissionProviderProps = {
  user: PermissionUser;
  permissions: PermissionEntry[];
  children: ReactNode;
};

export function PermissionProvider({
  user,
  permissions,
  children
}: PermissionProviderProps) {
  const value = useMemo<PermissionContextValue>(() => {
    return {
      user,
      permissions,
      // `can` is the single client-side helper used by buttons, menus and row actions.
      can: (resource: string, action: PermissionAction) =>
        canAccess(permissions, resource, action)
    };
  }, [permissions, user]);

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionContext);

  if (!context) {
    throw new Error('usePermissions must be used inside PermissionProvider');
  }

  return context;
}

type CanProps = {
  resource: string;
  action: PermissionAction;
  children: ReactNode;
  fallback?: ReactNode;
};

export function Can({ resource, action, children, fallback = null }: CanProps) {
  // Tiny wrapper for hide/show UI without repeating `can(...) ? ... : null`.
  const { can } = usePermissions();
  return can(resource, action) ? <>{children}</> : <>{fallback}</>;
}
