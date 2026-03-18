'use client';

import { useEffect } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useTranslate } from '@/hooks/use-translate';
import type { Category } from '@/server/action/category/types';
import CategoryForm from './category-form';

type CategoryFormPageProps = {
  initialData: Category | null;
};

export default function CategoryFormPage({
  initialData
}: CategoryFormPageProps) {
  const { t } = useTranslate();
  const isEditMode = Boolean(initialData?.id);

  const title = isEditMode
    ? t('category.editTitle')
    : t('category.createTitle');
  const description = isEditMode
    ? t('category.editDescription')
    : t('category.createDescription');

  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div className='flex-1 space-y-4'>
      {/* Keep the page heading in a client component so it follows the selected language. */}
      <Heading title={title} description={description} />
      <Separator />
      <CategoryForm initialData={initialData} />
    </div>
  );
}
