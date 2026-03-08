import PageContainer from '@/components/layout/page-container';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import AddRolePage from '@/features/role/components/add-role/page';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';

export default function Page() {
  // Server permission guard keeps hidden UI and direct URLs consistent.
  return (
    <PageContainer>
      <AdminPageGuard
        resource={adminRoutePermissions.roles.create.resource}
        action={adminRoutePermissions.roles.create.action}
      >
        <div className='flex w-full flex-col gap-6'>
          <Heading
            title='Create Role'
            description='Define permissions and assign access for a new role.'
          />
          <Separator />
          <AddRolePage />
        </div>
      </AdminPageGuard>
    </PageContainer>
  );
}
