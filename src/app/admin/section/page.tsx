import PageContainer from '@/components/layout/page-container';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import SectionsListScreen from '@/features/section/components/sections-list-screen';
import { getAdminAccess } from '@/lib/admin-access';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';
import { canAccess } from '@/lib/permissions';

export const metadata = {
  title: 'Site Sections'
};

export default async function Page() {
  const access = await getAdminAccess();
  const canCreateSection = canAccess(
    access.permissions,
    adminRoutePermissions.sections.create.resource,
    adminRoutePermissions.sections.create.action
  );
  // Server permission guard keeps hidden UI and direct URLs consistent.
  return (
    <PageContainer scrollable={true}>
      <AdminPageGuard
        resource={adminRoutePermissions.sections.list.resource}
        action={adminRoutePermissions.sections.list.action}
      >
        <SectionsListScreen canCreateSection={canCreateSection} />
      </AdminPageGuard>
    </PageContainer>
  );
}
