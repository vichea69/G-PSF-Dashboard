import PageContainer from '@/components/layout/page-container';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import CategoryFormPage from '@/features/categories/components/category-form-page';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';
import { getCategoryById } from '@/server/action/category/category';

export const metadata = { title: 'Dashboard: Edit Category' };

type PageProps = { params: Promise<{ id: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  // Server permission guard keeps hidden UI and direct URLs consistent.
  return (
    <PageContainer scrollable>
      <AdminPageGuard
        resource={adminRoutePermissions.categories.update.resource}
        action={adminRoutePermissions.categories.update.action}
      >
        <CategoryEditContent categoryId={params.id} />
      </AdminPageGuard>
    </PageContainer>
  );
}

async function CategoryEditContent({ categoryId }: { categoryId: string }) {
  const payload = await getCategoryById(categoryId);
  const category = (payload as any)?.data ?? payload;

  return <CategoryFormPage initialData={category} />;
}
