import PageContainer from '@/components/layout/page-container';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import WorkingGroupsListPage from '@/features/working-group/component/working-groups-list';
import { getAdminAccess } from '@/lib/admin-access';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';
import { canAccess } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard: Working Groups'
};

export default async function WorkingGroupPage() {
  const access = await getAdminAccess();
  const canCreateWorkingGroup = canAccess(
    access.permissions,
    adminRoutePermissions.workingGroups.create.resource,
    adminRoutePermissions.workingGroups.create.action
  );
  // Server permission guard keeps hidden UI and direct URLs consistent.
  return (
    <PageContainer scrollable={true}>
      <AdminPageGuard
        resource={adminRoutePermissions.workingGroups.list.resource}
        action={adminRoutePermissions.workingGroups.list.action}
      >
        <div className='flex flex-1 flex-col space-y-4'>
          <div className='flex items-start justify-between'>
            <Heading
              title='Working Groups'
              description='Manage working-group content blocks.'
            />
            {canCreateWorkingGroup ? (
              <Link
                href='/admin/working-group/new'
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
            <WorkingGroupsListPage />
          </Suspense>
        </div>
      </AdminPageGuard>
    </PageContainer>
  );
}
