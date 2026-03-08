import Link from 'next/link';
import type { ReactNode } from 'react';
import { ShieldAlert } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { buttonVariants } from '@/components/ui/button';
import { getAdminAccess } from '@/lib/admin-access';
import { canAccess, type PermissionAction } from '@/lib/permissions';
import { cn } from '@/lib/utils';

type AdminPageGuardProps = {
  resource: string;
  action: PermissionAction;
  children: ReactNode;
};

export async function AdminPageGuard({
  resource,
  action,
  children
}: AdminPageGuardProps) {
  // Server-side guard: even if a user types a direct URL, the page still checks permission.
  const access = await getAdminAccess();

  if (canAccess(access.permissions, resource, action)) {
    return <>{children}</>;
  }

  return (
    <Alert className='max-w-xl'>
      <ShieldAlert className='h-4 w-4' />
      <AlertTitle>Access denied</AlertTitle>
      <AlertDescription className='space-y-3'>
        <p>You do not have permission to open this page.</p>
        <Link
          href='/admin/overview'
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
        >
          Back to Overview
        </Link>
      </AlertDescription>
    </Alert>
  );
}
