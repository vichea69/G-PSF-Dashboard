import PageContainer from '@/components/layout/page-container';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';
import { RolesListScreen } from '@/features/role/components/roles-list-screen';

export const metadata = {
  title: 'Role'
};
// Page that wires the layout to the permission feature.
export default function PermissionPage() {
  // Server permission guard keeps hidden UI and direct URLs consistent.
  return (
    <PageContainer scrollable={false}>
      <AdminPageGuard
        resource={adminRoutePermissions.roles.list.resource}
        action={adminRoutePermissions.roles.list.action}
      >
        <RolesListScreen />
      </AdminPageGuard>
    </PageContainer>
  );
}
