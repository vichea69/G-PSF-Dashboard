'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { IconArrowLeft } from '@tabler/icons-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useTranslate } from '@/hooks/use-translate';
import { cn } from '@/lib/utils';
import { PageTreeView, type PageTreeData } from './page-tree-view';

type PageTreeScreenProps = {
  pageId: string;
  data?: PageTreeData;
  errorMessage?: string;
};

export default function PageTreeScreen({
  pageId,
  data,
  errorMessage
}: PageTreeScreenProps) {
  const { t } = useTranslate();

  useEffect(() => {
    document.title = t('page.tree.title');
  }, [t]);

  return (
    <div className='flex-1 space-y-4'>
      {/* Keep the page tree heading in a client component so it follows language changes. */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <Heading
          title={t('page.tree.title')}
          description={t('page.tree.description')}
        />

        <Link
          href='/admin/page'
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'text-xs md:text-sm'
          )}
        >
          <IconArrowLeft className='mr-2 h-4 w-4' />
          {t('page.tree.backToPages')}
        </Link>
      </div>

      <Separator />

      {data ? (
        <PageTreeView pageId={pageId} data={data} />
      ) : (
        <Alert variant='destructive' appearance='light'>
          <AlertTitle>{t('page.tree.loadErrorTitle')}</AlertTitle>
          <AlertDescription>
            {errorMessage || t('page.tree.loadErrorDescription')}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
