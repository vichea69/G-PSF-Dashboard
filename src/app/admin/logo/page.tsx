import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Suspense } from 'react';
import LogoListPage from '@/features/logo/components/logo-list';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { IconPlus } from '@tabler/icons-react';

export const metadata = {
  title: 'Dashboard: Logo'
};

export default function Page() {
  return (
    <PageContainer scrollable={true}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading title='Logo' description='Site logo settings' />
          {/* Add new logo */}
          <Link
            href='/admin/logo/new'
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <IconPlus className='mr-2 h-4 w-4' /> Add New
          </Link>
        </div>
        <Separator />
        <Suspense fallback={<DataTableSkeleton columnCount={6} rowCount={6} />}>
          <LogoListPage />
        </Suspense>
      </div>
    </PageContainer>
  );
}
