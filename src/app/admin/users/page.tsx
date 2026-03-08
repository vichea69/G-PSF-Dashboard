import PageContainer from '@/components/layout/page-container';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Suspense } from 'react';
import UsersViewPage from '@/features/users/components/users-page';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';

export const metadata = { title: 'Users' };

export default async function UsersPage() {
  // Server permission guard keeps hidden UI and direct URLs consistent.
  return (
    <PageContainer scrollable={false}>
      <AdminPageGuard
        resource={adminRoutePermissions.users.list.resource}
        action={adminRoutePermissions.users.list.action}
      >
        <div className='flex flex-1 flex-col space-y-4'>
          <div className='flex items-start justify-between'>
            <Heading title='Users' description='Manage users' />
          </div>
          <Separator />
          <Suspense fallback={null}>
            <UsersViewPage />
          </Suspense>
        </div>
      </AdminPageGuard>
    </PageContainer>
  );
}
