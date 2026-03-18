import PageContainer from '@/components/layout/page-container';
import PostEditorScreen from '@/features/post/component/post-editor-screen';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';

export const metadata = {
  title: 'Dashboard: New Post'
};

type PageProps = {
  searchParams?: Promise<{ pageId?: string; sectionId?: string }>;
};

export default async function NewPostPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const pageIdValue = String(resolvedSearchParams?.pageId ?? '').trim();
  const sectionIdValue = String(resolvedSearchParams?.sectionId ?? '').trim();
  const initialPageId = Number(pageIdValue);
  const initialSectionId = Number(sectionIdValue);

  // Server permission guard keeps hidden UI and direct URLs consistent.
  return (
    <PageContainer scrollable>
      <AdminPageGuard
        resource={adminRoutePermissions.posts.create.resource}
        action={adminRoutePermissions.posts.create.action}
      >
        <PostEditorScreen
          mode='create'
          postId='new'
          initialPageId={Number.isFinite(initialPageId) ? initialPageId : 0}
          initialSectionId={
            Number.isFinite(initialSectionId) ? initialSectionId : 0
          }
        />
      </AdminPageGuard>
    </PageContainer>
  );
}
