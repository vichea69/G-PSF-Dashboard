import PageContainer from '@/components/layout/page-container';
import FormCardSkeleton from '@/components/form-card-skeleton';
import PageEditorScreen from '@/features/page/component/page-editor-screen';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import { Suspense } from 'react';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';

export const metadata = {
  title: 'Dashboard: New Page'
};

export default async function Page() {
  // Server permission guard keeps hidden UI and direct URLs consistent.
  return (
    <PageContainer scrollable>
      <AdminPageGuard
        resource={adminRoutePermissions.pages.create.resource}
        action={adminRoutePermissions.pages.create.action}
      >
        <Suspense fallback={<FormCardSkeleton />}>
          <PageEditorScreen mode='create' />
        </Suspense>
      </AdminPageGuard>
    </PageContainer>
  );
}
