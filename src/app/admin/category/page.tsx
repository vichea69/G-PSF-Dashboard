import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Suspense } from 'react';
import CategoriesViewPage from '@/features/categories/components/categories-page';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { IconPlus } from '@tabler/icons-react';

export const metadata = { title: 'Dashboard: Categories' };

export default async function Page() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading title='Categories' description='Manage categories' />
          <Link
            href='/admin/category/new'
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <IconPlus className='mr-2 h-4 w-4' /> Add New
          </Link>
        </div>
        <Separator />
        <Suspense fallback={null}>
          <CategoriesViewPage />
        </Suspense>
      </div>
    </PageContainer>
  );
}
