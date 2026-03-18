import PageContainer from '@/components/layout/page-container';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';
import { RoleCreateScreen } from '@/features/role/components/role-create-screen';

export default function Page() {
  // Server permission guard keeps hidden UI and direct URLs consistent.
  return (
    <PageContainer>
      <AdminPageGuard
        resource={adminRoutePermissions.roles.create.resource}
        action={adminRoutePermissions.roles.create.action}
      >
        <RoleCreateScreen />
      </AdminPageGuard>
    </PageContainer>
  );
}
