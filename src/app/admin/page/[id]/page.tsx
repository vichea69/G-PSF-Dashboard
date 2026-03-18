import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import { Suspense } from 'react';
import PageEditorScreen from '@/features/page/component/page-editor-screen';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';

export const metadata = {
  title: 'Dashboard: Edit Page'
};

type PageProps = { params: Promise<{ id: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  // Server permission guard keeps hidden UI and direct URLs consistent.
  return (
    <PageContainer scrollable>
      <AdminPageGuard
        resource={adminRoutePermissions.pages.update.resource}
        action={adminRoutePermissions.pages.update.action}
      >
        <Suspense fallback={<FormCardSkeleton />}>
          <PageEditorScreen mode='edit' pageId={params.id} />
        </Suspense>
      </AdminPageGuard>
    </PageContainer>
  );
}
