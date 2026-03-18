import PageContainer from '@/components/layout/page-container';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import CategoryFormPage from '@/features/categories/components/category-form-page';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';

export const metadata = { title: 'Dashboard: New Category' };

export default async function Page() {
  // Server permission guard keeps hidden UI and direct URLs consistent.
  return (
    <PageContainer scrollable>
      <AdminPageGuard
        resource={adminRoutePermissions.categories.create.resource}
        action={adminRoutePermissions.categories.create.action}
      >
        <CategoryFormPage initialData={null} />
      </AdminPageGuard>
    </PageContainer>
  );
}
