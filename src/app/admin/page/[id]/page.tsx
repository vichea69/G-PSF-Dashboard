import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Suspense } from 'react';
import PageViewPage from '@/features/page/component/page-view-page';

export const metadata = {
  title: 'Dashboard: Edit Page'
};

type PageProps = { params: Promise<{ id: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Heading
          title='Edit Page'
          description='Update the localized titles, slug, and SEO settings.'
        />
        <Separator />
        <Suspense fallback={<FormCardSkeleton />}>
          <PageViewPage pageId={params.id} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
