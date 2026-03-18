import PageContainer from '@/components/layout/page-container';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import PagesListScreen from '@/features/page/component/pages-list-screen';
import { getAdminAccess } from '@/lib/admin-access';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';
import { canAccess } from '@/lib/permissions';

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
        <PagesListScreen canCreatePage={canCreatePage} />
      </AdminPageGuard>
    </PageContainer>
  );
}
