import PageContainer from '@/components/layout/page-container';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';
import { RoleEditScreen } from '@/features/role/components/role-edit-screen';

type EditRolePageProps = {
  params: Promise<{ id: string }>;
};

const editRole = async (props: EditRolePageProps) => {
  const params = await props.params;
  // Server permission guard keeps hidden UI and direct URLs consistent.
  return (
    <PageContainer>
      <AdminPageGuard
        resource={adminRoutePermissions.roles.update.resource}
        action={adminRoutePermissions.roles.update.action}
      >
        <RoleEditScreen roleId={params.id} />
      </AdminPageGuard>
    </PageContainer>
  );
};

export default editRole;
