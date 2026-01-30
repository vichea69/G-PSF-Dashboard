'use client';

import { Card, CardContent } from '@/components/ui/card';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { createSection, updateSection } from '@/server/action/section/section';
import type { Section, SectionPayload } from '@/server/action/section/types';
import { Form } from '@/components/ui/form';
import {
  defaultValues,
  formSchema,
  type BlockType,
  type SectionFormValues
} from './section-form.schema';
import { useSectionFormData } from './section-form.data';
import { PageSelectField } from './fields/PageSelectField';
import { BlockTypeField } from './fields/BlockTypeField';
import { LocalizedFields } from './fields/LocalizedFields';
import { OrderEnabledRow } from './fields/OrderEnabledRow';
import { FormActions } from './fields/FormActions';
import { PostListForm } from '@/features/post/component/block/post-list/post-list-form';

export default function SectionForm({
  initialData
}: {
  initialData: Section | null;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { pages, categoryOptions } = useSectionFormData();

  const form = useForm<SectionFormValues>({
    resolver: zodResolver(formSchema),
    values: defaultValues(initialData)
  });
  const selectedBlockType = form.watch('blockType') as BlockType;
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'km'>('en');

  const qc = useQueryClient();
  const createMutation = useMutation({
    mutationFn: (values: SectionPayload) => createSection(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sections'] });
      toast.success('Section created successfully');
      router.replace('/admin/section');
    }
  });
  const updateMutation = useMutation({
    mutationFn: (values: SectionPayload) => {
      if (!initialData?.id) {
        throw new Error('Section id is required');
      }
      return updateSection(initialData.id, values);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sections'] });
      toast.success('Section updated successfully');
      router.replace('/admin/section');
    }
  });

  async function onSubmit(values: SectionFormValues) {
    setSubmitting(true);
    try {
      const titleEn = values.title.en?.trim() ?? '';
      const titleKm = values.title.km?.trim() ?? '';
      const title =
        titleEn || titleKm
          ? {
              en: titleEn || undefined,
              km: titleKm || undefined
            }
          : undefined;
      const descriptionEn = values.description.en?.trim() ?? '';
      const descriptionKm = values.description.km?.trim() ?? '';
      const description =
        descriptionEn || descriptionKm
          ? {
              en: descriptionEn || undefined,
              km: descriptionKm || undefined
            }
          : undefined;
      const categoryIds =
        values.settings.categoryIds && values.settings.categoryIds.length > 0
          ? values.settings.categoryIds
          : undefined;
      const settings =
        values.settings.sort ||
        values.settings.limit !== undefined ||
        categoryIds?.length
          ? {
              sort: values.settings.sort,
              limit: values.settings.limit,
              categoryIds
            }
          : undefined;
      const payload: SectionPayload = {
        pageId: values.pageId,
        blockType: values.blockType,
        title,
        description,
        settings,
        orderIndex: values.orderIndex,
        enabled: values.enabled
      };

      if (initialData?.id) await updateMutation.mutateAsync(payload);
      else await createMutation.mutateAsync(payload);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className='mx-auto w-full'>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <LocalizedFields
              control={form.control}
              activeLanguage={activeLanguage}
              onLanguageChange={setActiveLanguage}
            />

            <div className='flex flex-col gap-4 md:flex-row'>
              <PageSelectField control={form.control} pages={pages} />
              <BlockTypeField control={form.control} />
            </div>

            <OrderEnabledRow control={form.control} />

            {selectedBlockType === 'post_list' ? (
              <PostListForm
                control={form.control as any}
                categoryOptions={categoryOptions}
              />
            ) : null}

            <FormActions
              submitting={submitting}
              isEditing={Boolean(initialData)}
              onCancel={() => router.push('/admin/section')}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
