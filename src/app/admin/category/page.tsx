import PageContainer from '@/components/layout/page-container';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import { Suspense } from 'react';
import CategoriesViewPage from '@/features/categories/components/categories-page';
import { getAdminAccess } from '@/lib/admin-access';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';
import { canAccess } from '@/lib/permissions';

export const metadata = { title: 'Dashboard: Categories' };

export default async function Page() {
  const access = await getAdminAccess();
  const canCreateCategory = canAccess(
    access.permissions,
    adminRoutePermissions.categories.create.resource,
    adminRoutePermissions.categories.create.action
  );
  // Server permission guard keeps hidden UI and direct URLs consistent.
  return (
    <PageContainer scrollable={true}>
      <AdminPageGuard
        resource={adminRoutePermissions.categories.list.resource}
        action={adminRoutePermissions.categories.list.action}
      >
        <div className='flex flex-1 flex-col space-y-4'>
          <Suspense fallback={null}>
            <CategoriesViewPage canCreateCategory={canCreateCategory} />
          </Suspense>
        </div>
      </AdminPageGuard>
    </PageContainer>
  );
}
