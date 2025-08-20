import PageContainer from '@/components/layout/page-container';
import CategoryForm from '@/features/categories/components/category-form';

export const metadata = { title: 'Dashboard: New Category' };

export default async function Page() {
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <CategoryForm initialData={null} pageTitle='Create Category' />
      </div>
    </PageContainer>
  );
}
