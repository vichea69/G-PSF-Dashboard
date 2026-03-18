import PageContainer from '@/components/layout/page-container';
import PostEditorScreen from '@/features/post/component/post-editor-screen';
import { getPost } from '@/server/action/post/post';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
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
    <PostEditorScreen mode='edit' postId={postId} initialPost={initialPost} />
  );
}
