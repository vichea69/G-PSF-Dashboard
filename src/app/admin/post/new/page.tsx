import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import PostViewPage from '@/features/post/component/post-view-page';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';

export const metadata = {
  title: 'Dashboard: New Post'
};

export default function NewPostPage() {
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Heading
          title='Create POST'
          description='Set the post titles and content.'
        />
        <Separator />
        <Suspense fallback={<FormCardSkeleton />}>
          <PostViewPage postId={'new'} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
