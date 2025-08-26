import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import PostsListPage from '@/features/post/component/post-list';
import PostStatsClient from '@/features/post/component/post-stats-client';
import { cn } from '@/lib/utils';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard: Posts'
};

export default function PostPage() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading title='List Posts' description='Manage blog posts' />
          <Link
            href='/admin/post/new'
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <IconPlus className='mr-2 h-4 w-4' /> Add New
          </Link>
        </div>
        <Separator />
        {/* <PostStatsClient /> */}
        <Suspense fallback={<DataTableSkeleton columnCount={5} rowCount={8} />}>
          <PostsListPage />
        </Suspense>
      </div>
    </PageContainer>
  );
}
