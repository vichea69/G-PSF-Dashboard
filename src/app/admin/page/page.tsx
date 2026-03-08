import PageContainer from '@/components/layout/page-container';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import PagesListPage from '@/features/page/component/pages-list';
import PageStatsClient from '@/features/page/component/page-stats-client';
import { getAdminAccess } from '@/lib/admin-access';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';
import { canAccess } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata = {
  title: 'Site Pages'
};

export default async function Page() {
  const access = await getAdminAccess();
  const canCreatePage = canAccess(
    access.permissions,
    adminRoutePermissions.pages.create.resource,
    adminRoutePermissions.pages.create.action
  );
  // Server permission guard keeps hidden UI and direct URLs consistent.
  return (
    <PageContainer scrollable={true}>
      <AdminPageGuard
        resource={adminRoutePermissions.pages.list.resource}
        action={adminRoutePermissions.pages.list.action}
      >
        <div className='flex flex-1 flex-col space-y-4'>
          <div className='flex items-start justify-between'>
            <Heading title='Pages' description='Manage CMS pages' />
            {canCreatePage ? (
              <Link
                href='/admin/page/new'
                className={cn(buttonVariants(), 'text-xs md:text-sm')}
              >
                <IconPlus className='mr-2 h-4 w-4' /> Add New
              </Link>
            ) : null}
          </div>
          <Separator />
          <PageStatsClient />
          <Suspense
            fallback={<DataTableSkeleton columnCount={5} rowCount={8} />}
          >
            <PagesListPage />
          </Suspense>
        </div>
      </AdminPageGuard>
    </PageContainer>
  );
}
