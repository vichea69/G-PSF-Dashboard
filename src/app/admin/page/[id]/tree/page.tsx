import PageContainer from '@/components/layout/page-container';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import PageTreePage from '@/features/page/component/page-tree-page';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';

export const metadata = {
  title: 'Dashboard: Page Tree'
};

type TreePageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page(props: TreePageProps) {
  const params = await props.params;
  // Server permission guard keeps hidden UI and direct URLs consistent.
  return (
    <PageContainer scrollable>
      <AdminPageGuard
        resource={adminRoutePermissions.pages.tree.resource}
        action={adminRoutePermissions.pages.tree.action}
      >
        <PageTreePage pageId={params.id} />
      </AdminPageGuard>
    </PageContainer>
  );
}
