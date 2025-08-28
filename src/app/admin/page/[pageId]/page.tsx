import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import PageViewPage from '@/features/page/component/page-view-page';

export const metadata = {
  title: 'Dashboard: Page View'
};

type PageProps = { params: Promise<{ pageId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <PageViewPage pageId={params.pageId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
