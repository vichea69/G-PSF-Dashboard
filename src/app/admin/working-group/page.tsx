import PageContainer from '@/components/layout/page-container';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import { getAdminAccess } from '@/lib/admin-access';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';
import { canAccess } from '@/lib/permissions';
import WorkingGroupListScreen from '@/features/working-group/component/working-group-list-screen';

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
        <WorkingGroupListScreen canCreateWorkingGroup={canCreateWorkingGroup} />
      </AdminPageGuard>
    </PageContainer>
  );
}
