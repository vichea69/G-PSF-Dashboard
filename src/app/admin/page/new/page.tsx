import PageContainer from '@/components/layout/page-container';
import FormCardSkeleton from '@/components/form-card-skeleton';
import PageCreatePage from '@/features/page/component/page-create-page';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard: New Page'
};

export default async function Page() {
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Heading
          title='Create Page'
          description='Set the page titles and content.'
        />
        <Separator />
        <Suspense fallback={<FormCardSkeleton />}>
          <PageCreatePage />
        </Suspense>
      </div>
    </PageContainer>
  );
}
