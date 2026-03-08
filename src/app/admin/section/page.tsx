import PageContainer from '@/components/layout/page-container';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import SectionsListPage from '@/features/section/components/sections-list';
import { getAdminAccess } from '@/lib/admin-access';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';
import { canAccess } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata = {
  title: 'Site Sections'
};

export default async function Page() {
  const access = await getAdminAccess();
  const canCreateSection = canAccess(
    access.permissions,
    adminRoutePermissions.sections.create.resource,
    adminRoutePermissions.sections.create.action
  );
  // Server permission guard keeps hidden UI and direct URLs consistent.
  return (
    <PageContainer scrollable={true}>
      <AdminPageGuard
        resource={adminRoutePermissions.sections.list.resource}
        action={adminRoutePermissions.sections.list.action}
      >
        <div className='flex flex-1 flex-col space-y-4'>
          <div className='flex items-start justify-between'>
            <Heading title='Sections' description='Manage CMS sections' />
            {canCreateSection ? (
              <Link
                href='/admin/section/new'
                className={cn(buttonVariants(), 'text-xs md:text-sm')}
              >
                <IconPlus className='mr-2 h-4 w-4' /> Add New
              </Link>
            ) : null}
          </div>
          <Separator />
          <Suspense
            fallback={<DataTableSkeleton columnCount={6} rowCount={8} />}
          >
            <SectionsListPage />
          </Suspense>
        </div>
      </AdminPageGuard>
    </PageContainer>
  );
}
