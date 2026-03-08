import PageContainer from '@/components/layout/page-container';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import { Suspense } from 'react';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/heading';
import SiteSetting from '@/features/site-setting/components/site-setting-list';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';

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
        <div className='flex flex-1 flex-col space-y-4'>
          <div className='flex items-start justify-between'>
            <Heading
              title='Site Settings '
              description='Manage Logo and Page site'
            />
          </div>
          <Separator />
          <Suspense fallback={null}>
            <SiteSetting />
          </Suspense>
        </div>
      </AdminPageGuard>
    </PageContainer>
  );
}
