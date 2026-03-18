import PageContainer from '@/components/layout/page-container';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import PostsListScreen from '@/features/post/component/posts-list-screen';
import { getAdminAccess } from '@/lib/admin-access';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';
import { canAccess } from '@/lib/permissions';

export const metadata = {
  title: 'Dashboard: Posts'
};

export default async function PostPage() {
  const access = await getAdminAccess();
  const canCreatePost = canAccess(
    access.permissions,
    adminRoutePermissions.posts.create.resource,
    adminRoutePermissions.posts.create.action
  );
  // Server permission guard keeps hidden UI and direct URLs consistent.
  return (
    <PageContainer scrollable={true}>
      <AdminPageGuard
        resource={adminRoutePermissions.posts.list.resource}
        action={adminRoutePermissions.posts.list.action}
      >
        <PostsListScreen canCreatePost={canCreatePost} />
      </AdminPageGuard>
    </PageContainer>
  );
}
