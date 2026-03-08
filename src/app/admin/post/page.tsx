import PageContainer from '@/components/layout/page-container';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import PostsListPage from '@/features/post/component/post-list';
import { getAdminAccess } from '@/lib/admin-access';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';
import { canAccess } from '@/lib/permissions';
import { cn } from '@/lib/utils';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { Suspense } from 'react';

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
        <div className='flex flex-1 flex-col space-y-4'>
          <div className='flex items-start justify-between'>
            <Heading title='List Posts' description='Manage blog posts' />
            {canCreatePost ? (
              <Link
                href='/admin/post/new'
                className={cn(buttonVariants(), 'text-xs md:text-sm')}
              >
                <IconPlus className='mr-2 h-4 w-4' /> Add New
              </Link>
            ) : null}
          </div>
          <Separator />
          <Suspense
            fallback={<DataTableSkeleton columnCount={5} rowCount={8} />}
          >
            <PostsListPage />
          </Suspense>
        </div>
      </AdminPageGuard>
    </PageContainer>
  );
}
