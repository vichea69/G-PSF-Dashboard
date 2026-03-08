import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import CategoryForm from '@/features/categories/components/category-form';
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
        <div className='flex-1 space-y-4'>
          <Heading
            title='Create Category'
            description='Set the category names and descriptions.'
          />
          <Separator />
          <CategoryForm initialData={null} />
        </div>
      </AdminPageGuard>
    </PageContainer>
  );
}
