import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import LogoEditorScreen from '@/features/logo/components/logo-editor-screen';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';

export const metadata = {
  title: 'Dashboard: Edit Logo'
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditLogoPage(props: PageProps) {
  const params = await props.params;
  const logoId = params.id;
  // Server permission guard keeps hidden UI and direct URLs consistent.
  return (
    <PageContainer scrollable>
      <AdminPageGuard
        resource={adminRoutePermissions.logo.update.resource}
        action={adminRoutePermissions.logo.update.action}
      >
        <Suspense fallback={<FormCardSkeleton />}>
          <LogoEditorScreen mode='edit' logoId={logoId} />
        </Suspense>
      </AdminPageGuard>
    </PageContainer>
  );
}
