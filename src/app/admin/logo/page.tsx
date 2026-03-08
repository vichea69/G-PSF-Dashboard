import PageContainer from '@/components/layout/page-container';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Suspense } from 'react';
import LogoListPage from '@/features/logo/components/logo-list';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import Link from 'next/link';
import { getAdminAccess } from '@/lib/admin-access';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';
import { canAccess } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { IconPlus } from '@tabler/icons-react';

export const metadata = {
  title: 'Dashboard: Logo'
};

export default async function Page() {
  const access = await getAdminAccess();
  const canCreateLogo = canAccess(
    access.permissions,
    adminRoutePermissions.logo.create.resource,
    adminRoutePermissions.logo.create.action
  );
  // Server permission guard keeps hidden UI and direct URLs consistent.
  return (
    <PageContainer scrollable={true}>
      <AdminPageGuard
        resource={adminRoutePermissions.logo.list.resource}
        action={adminRoutePermissions.logo.list.action}
      >
        <div className='flex flex-1 flex-col space-y-4'>
          <div className='flex items-start justify-between'>
            <Heading title='Logo' description='Site logo settings' />
            {canCreateLogo ? (
              <Link
                href='/admin/logo/new'
                className={cn(buttonVariants(), 'text-xs md:text-sm')}
              >
                <IconPlus className='mr-2 h-4 w-4' /> Add New
              </Link>
            ) : null}
          </div>
          <Separator />
          <Suspense
            fallback={<DataTableSkeleton columnCount={6} rowCount={6} />}
          >
            <LogoListPage />
          </Suspense>
        </div>
      </AdminPageGuard>
    </PageContainer>
  );
}
