'use client';

import { useEffect } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useTranslate } from '@/hooks/use-translate';
import TestimonialForm from './testimonail-form';
import type { LocalizedText } from '@/lib/helpers';

type TestimonialInitialData = {
  id?: string | number;
  title?: LocalizedText;
  quote?: LocalizedText;
  authorName?: LocalizedText;
  authorRole?: LocalizedText;
  company?: string;
  rating?: number | string;
  avatarUrl?: string;
  status?: string;
  orderIndex?: number | string;
} | null;

type TestimonialFormPageProps = {
  initialData?: TestimonialInitialData;
};

export default function TestimonialFormPage({
  initialData
}: TestimonialFormPageProps) {
  const { t } = useTranslate();
  const isEditMode = Boolean(initialData?.id);

  const title = isEditMode
    ? t('testimonial.editTitle')
    : t('testimonial.createTitle');
  const description = isEditMode
    ? t('testimonial.editDescription')
    : t('testimonial.createDescription');

  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div className='flex-1 space-y-4'>
      {/* Reuse one client wrapper for both create and edit pages. */}
      <Heading title={title} description={description} />
      <Separator />
      <TestimonialForm initialData={initialData} />
    </div>
  );
}
