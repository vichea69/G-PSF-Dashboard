'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { IconPlus } from '@tabler/icons-react';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { useTranslate } from '@/hooks/use-translate';
import { cn } from '@/lib/utils';
import PageStatsClient from './page-stats-client';
import PagesListPage from './pages-list';

type PagesListScreenProps = {
  canCreatePage: boolean;
};

export default function PagesListScreen({
  canCreatePage
}: PagesListScreenProps) {
  const { t } = useTranslate();

  useEffect(() => {
    document.title = t('page.title');
  }, [t]);

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      {/* Keep the list page heading in a client component so it follows the selected language. */}
      <div className='flex items-start justify-between'>
        <Heading title={t('page.title')} description={t('page.description')} />
        {canCreatePage ? (
          <Link
            href='/admin/page/new'
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <IconPlus className='mr-2 h-4 w-4' /> {t('page.addNew')}
          </Link>
        ) : null}
      </div>
      <Separator />
      <PageStatsClient />
      <PagesListPage
        fallback={<DataTableSkeleton columnCount={5} rowCount={8} />}
      />
    </div>
  );
}
