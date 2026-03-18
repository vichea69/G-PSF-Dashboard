'use client';

import { useEffect } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useTranslate } from '@/hooks/use-translate';
import type { WorkingGroupItem } from '@/server/action/working-group/working-group-type';
import WorkingGroupForm from './working-group-form';

type WorkingGroupFormPageProps = {
  initialData?: WorkingGroupItem | null;
};

export default function WorkingGroupFormPage({
  initialData
}: WorkingGroupFormPageProps) {
  const { t } = useTranslate();
  const isEditMode = Boolean(initialData?.id);

  const title = isEditMode
    ? t('workingGroup.editTitle')
    : t('workingGroup.createTitle');
  const description = isEditMode
    ? t('workingGroup.editDescription')
    : t('workingGroup.createDescription');

  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div className='flex-1 space-y-4'>
      {/* Reuse one client wrapper for both create and edit pages. */}
      <Heading title={title} description={description} />
      <Separator />
      <WorkingGroupForm initialData={initialData} />
    </div>
  );
}
