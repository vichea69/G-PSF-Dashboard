import PageContainer from '@/components/layout/page-container';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import { getAdminAccess } from '@/lib/admin-access';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';
import { canAccess } from '@/lib/permissions';
import LogoListScreen from '@/features/logo/components/logo-list-screen';

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
        <LogoListScreen canCreateLogo={canCreateLogo} />
      </AdminPageGuard>
    </PageContainer>
  );
}
