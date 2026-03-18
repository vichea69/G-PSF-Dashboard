import PageContainer from '@/components/layout/page-container';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';
import { SiteSettingScreen } from '@/features/site-setting/components/site-setting-screen';

export const metadata = {
  title: 'Site Setting'
};
// Page that wires the layout to the permission feature.
export default function Page() {
  // Server permission guard keeps hidden UI and direct URLs consistent.
  return (
    <PageContainer>
      <AdminPageGuard
        resource={adminRoutePermissions.siteSettings.list.resource}
        action={adminRoutePermissions.siteSettings.list.action}
      >
        <SiteSettingScreen />
      </AdminPageGuard>
    </PageContainer>
  );
}
