import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import PostViewPage from '@/features/post/component/post-view-page';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
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
        <div className='flex-1 space-y-4'>
          <Heading
            title='Create POST'
            description='Set the post titles and content.'
          />
          <Separator />
          <Suspense fallback={<FormCardSkeleton />}>
            <PostViewPage
              postId={'new'}
              initialPageId={Number.isFinite(initialPageId) ? initialPageId : 0}
              initialSectionId={
                Number.isFinite(initialSectionId) ? initialSectionId : 0
              }
            />
          </Suspense>
        </div>
      </AdminPageGuard>
    </PageContainer>
  );
}
