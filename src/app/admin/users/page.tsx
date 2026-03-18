import PageContainer from '@/components/layout/page-container';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';
import { UsersListScreen } from '@/features/users/components/users-list-screen';

export const metadata = { title: 'Users' };

export default async function UsersPage() {
  // Server permission guard keeps hidden UI and direct URLs consistent.
  return (
    <PageContainer scrollable={false}>
      <AdminPageGuard
        resource={adminRoutePermissions.users.list.resource}
        action={adminRoutePermissions.users.list.action}
      >
        <UsersListScreen />
      </AdminPageGuard>
    </PageContainer>
  );
}
