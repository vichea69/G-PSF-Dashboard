import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import PostViewPage from '@/features/post/component/post-view-page';

export const metadata = {
  title: 'Dashboard: Post View'
};

type PageProps = { params: Promise<{ id: string }> };

export default async function PostPage(props: PageProps) {
  const params = await props.params;
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <PostViewPage postId={params.id} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
