import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import PostViewPage from '@/features/post/component/post-view-page';
import { getPost } from '@/server/action/post/post';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';

export const metadata = {
  title: 'Dashboard: Post View'
};

type PageProps = { params: Promise<{ id: string }> };

export default async function PostPage(props: PageProps) {
  const params = await props.params;
  // Server permission guard keeps hidden UI and direct URLs consistent.
  return (
    <PageContainer scrollable>
      <AdminPageGuard
        resource={adminRoutePermissions.posts.update.resource}
        action={adminRoutePermissions.posts.update.action}
      >
        <PostEditContent postId={params.id} />
      </AdminPageGuard>
    </PageContainer>
  );
}

async function PostEditContent({ postId }: { postId: string }) {
  const result = await getPost(postId);
  const initialPost = result.success ? result.data : null;

  return (
    <div className='flex-1 space-y-4'>
      <Heading title='Edit Post' description='Update the post details.' />
      <Separator />
      <Suspense fallback={<FormCardSkeleton />}>
        <PostViewPage postId={postId} initialPost={initialPost} />
      </Suspense>
    </div>
  );
}
