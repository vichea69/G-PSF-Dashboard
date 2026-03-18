import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import LogoEditorScreen from '@/features/logo/components/logo-editor-screen';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';

export const metadata = {
  title: 'New Logo'
};

export default function Page() {
  // Server permission guard keeps hidden UI and direct URLs consistent.
  return (
    <PageContainer scrollable>
      <AdminPageGuard
        resource={adminRoutePermissions.logo.create.resource}
        action={adminRoutePermissions.logo.create.action}
      >
        <Suspense fallback={<FormCardSkeleton />}>
          <LogoEditorScreen mode='create' />
        </Suspense>
      </AdminPageGuard>
    </PageContainer>
  );
}
