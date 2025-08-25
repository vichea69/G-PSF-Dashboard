import PageContainer from '@/components/layout/page-container';
import CategoryForm from '@/features/categories/components/category-form';
import { getCategoryById } from '@/server/action/category/category';

export const metadata = { title: 'Dashboard: Edit Category' };

type PageProps = { params: Promise<{ id: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  const payload = await getCategoryById(params.id);
  const category = (payload as any)?.data ?? payload;
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <CategoryForm initialData={category} pageTitle='Edit Category' />
      </div>
    </PageContainer>
  );
}
