'use client';

import { useEffect } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useTranslate } from '@/hooks/use-translate';
import type { Section } from '@/server/action/section/types';
import SectionForm from './section-form';

type SectionFormPageProps = {
  initialData: Section | null;
  initialPageId?: number;
};

export default function SectionFormPage({
  initialData,
  initialPageId
}: SectionFormPageProps) {
  const { t } = useTranslate();
  const isEditMode = Boolean(initialData?.id);

  const title = isEditMode ? t('section.editTitle') : t('section.createTitle');
  const description = isEditMode
    ? t('section.editDescription')
    : t('section.createDescription');

  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div className='flex-1 space-y-4'>
      {/* Keep create/edit page headings in one shared client wrapper. */}
      <Heading title={title} description={description} />
      <Separator />
      <SectionForm initialData={initialData} initialPageId={initialPageId} />
    </div>
  );
}
