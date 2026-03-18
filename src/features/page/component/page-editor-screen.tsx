'use client';

import { useEffect } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useTranslate } from '@/hooks/use-translate';
import PageCreatePage from './page-create-page';
import PageViewPage from './page-view-page';

type PageEditorScreenProps = {
  mode: 'create' | 'edit';
  pageId?: string;
};

export default function PageEditorScreen({
  mode,
  pageId
}: PageEditorScreenProps) {
  const { t } = useTranslate();

  const title = mode === 'edit' ? t('page.editTitle') : t('page.createTitle');
  const description =
    mode === 'edit' ? t('page.editDescription') : t('page.createDescription');

  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div className='flex-1 space-y-4'>
      {/* Keep create/edit page headings in one shared client wrapper. */}
      <Heading title={title} description={description} />
      <Separator />
      {mode === 'edit' && pageId ? (
        <PageViewPage pageId={pageId} />
      ) : (
        <PageCreatePage />
      )}
    </div>
  );
}
