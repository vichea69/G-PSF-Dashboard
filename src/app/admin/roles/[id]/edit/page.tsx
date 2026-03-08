import PageContainer from '@/components/layout/page-container';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import { PermissionManager } from '@/features/role/components/edit-role/PermissionManager';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';

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
        <div className='flex w-full flex-col gap-6'>
          <Heading
            title='Edit Role'
            description='Adjust permissions and update role details.'
          />
          <Separator />
          <PermissionManager roleId={params.id} />
        </div>
      </AdminPageGuard>
    </PageContainer>
  );
};

export default editRole;
