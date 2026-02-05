'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { FileModal } from '@/components/modal/file-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/context/language-context';
import type { MediaFile } from '@/features/media/types/media-type';
import { usePage } from '@/hooks/use-page';
import { useWorkingGroups } from '@/hooks/use-working-group';
import { handleImageUpload } from '@/lib/tiptap-utils';
import { getLocalizedText, type LocalizedText } from '@/lib/helpers';
import {
  createWorkingGroup,
  updateWorkingGroup
} from '@/server/action/working-group/working-group';
import type {
  WorkingGroupInput,
  WorkingGroupItem
} from '@/server/action/working-group/working-group-type';

type WorkingGroupFormData = {
  title: {
    en: string;
    km: string;
  };
  description: {
    en: string;
    km: string;
  };
  iconUrl: string;
  status: 'draft' | 'published';
  pageId: string;
  orderIndex: number;
};

const getLocalizedValue = (
  value: LocalizedText | undefined,
  key: 'en' | 'km'
) => {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return '';
  const candidate = value[key];
  return typeof candidate === 'string' ? candidate : '';
};

export default function WorkingGroupForm({
  initialData
}: {
  initialData?: WorkingGroupItem | null;
}) {
  const isEditing = Boolean(initialData?.id);
  const [formData, setFormData] = useState<WorkingGroupFormData>({
    title: {
      en: getLocalizedValue(initialData?.title, 'en'),
      km: getLocalizedValue(initialData?.title, 'km')
    },
    description: {
      en: getLocalizedValue(initialData?.description, 'en'),
      km: getLocalizedValue(initialData?.description, 'km')
    },
    iconUrl: initialData?.iconUrl ?? '',
    status:
      String(initialData?.status ?? 'draft').toLowerCase() === 'published'
        ? 'published'
        : 'draft',
    pageId: String(initialData?.pageId ?? initialData?.page?.id ?? ''),
    orderIndex: Number(initialData?.orderIndex ?? 1) || 1
  });
  const [submitting, setSubmitting] = useState(false);
  const [iconPreviewError, setIconPreviewError] = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [iconUploadLoading, setIconUploadLoading] = useState(false);

  const router = useRouter();
  const qc = useQueryClient();
  const { language } = useLanguage();
  const { data: pagesData } = usePage();
  const { data: workingGroups = [] } = useWorkingGroups();

  const usedPageIds = useMemo(() => {
    return new Set(
      (workingGroups ?? [])
        .map((item) => item?.pageId ?? item?.page?.id)
        .filter((value) => value !== null && value !== undefined)
        .map((value) => String(value))
    );
  }, [workingGroups]);

  const currentPageId = formData.pageId ? String(formData.pageId) : '';

  const pages = useMemo(() => {
    const raw = (pagesData?.data ?? pagesData) as any;
    const list = Array.isArray(raw) ? raw : [];
    return list
      .map((page) => ({
        id: String(page?.id ?? ''),
        label:
          getLocalizedText(page?.title, language) ||
          page?.slug ||
          `Page ${page?.id ?? ''}`,
        isUsed:
          usedPageIds.has(String(page?.id ?? '')) &&
          String(page?.id ?? '') !== currentPageId
      }))
      .filter((page) => page.id);
  }, [pagesData, language, usedPageIds, currentPageId]);

  const createMutation = useMutation({
    mutationFn: (payload: WorkingGroupInput) => createWorkingGroup(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['working-groups'] });
      toast.success('Working group created successfully');
      router.replace('/admin/working-group');
    }
  });
  const updateMutation = useMutation({
    mutationFn: (payload: WorkingGroupInput) => {
      if (!initialData?.id) {
        throw new Error('Working group id is required');
      }
      return updateWorkingGroup(initialData.id, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['working-groups'] });
      toast.success('Working group updated successfully');
      router.replace('/admin/working-group');
    }
  });

  const iconPreviewUrl = formData.iconUrl.trim();

  const updateLocalizedField = (
    key: 'title' | 'description',
    lang: 'en' | 'km',
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [lang]: value
      }
    }));
  };

  const handleSelectIconFromMedia = (file: MediaFile) => {
    const selectedUrl = (file.url ?? file.thumbnail ?? '').trim();
    if (!selectedUrl) {
      toast.error('Selected media does not have a valid URL');
      return;
    }

    setIconPreviewError(false);
    setFormData((prev) => ({ ...prev, iconUrl: selectedUrl }));
  };

  const handleUploadIconFromDevice = async (files: File[]) => {
    const firstFile = files[0];
    if (!firstFile) return;

    setIconUploadLoading(true);
    try {
      const result = await handleImageUpload(firstFile);
      if (!result?.url) {
        throw new Error('Upload succeeded but no URL was returned');
      }
      setIconPreviewError(false);
      setFormData((prev) => ({ ...prev, iconUrl: result.url }));
      await qc.invalidateQueries({ queryKey: ['media'], exact: false });
      toast.success('Icon selected successfully');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to upload icon');
    } finally {
      setIconUploadLoading(false);
    }
  };

  const readErrorMessage = (error: any) => {
    const raw = error?.response?.data?.message;
    if (Array.isArray(raw)) return raw.join(', ');
    if (typeof raw === 'string') return raw;
    return (
      error?.message ||
      `Failed to ${isEditing ? 'update' : 'create'} working group`
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const titleEn = formData.title.en.trim();
    const titleKm = formData.title.km.trim();
    if (!titleEn && !titleKm) {
      toast.error('Title is required');
      return;
    }

    const descriptionEn = formData.description.en.trim();
    const descriptionKm = formData.description.km.trim();
    const parsedPageId = Number(formData.pageId);
    const pageIdValue =
      formData.pageId === ''
        ? null
        : Number.isFinite(parsedPageId)
          ? parsedPageId
          : formData.pageId;

    const payload: WorkingGroupInput = {
      title: {
        en: titleEn || titleKm,
        km: titleKm || undefined
      },
      description:
        descriptionEn || descriptionKm
          ? {
              en: descriptionEn || descriptionKm,
              km: descriptionKm || undefined
            }
          : undefined,
      iconUrl: formData.iconUrl.trim() || undefined,
      status: formData.status,
      ...(pageIdValue !== null
        ? { pageId: pageIdValue }
        : isEditing
          ? { pageId: null }
          : {}),
      orderIndex: Number.isFinite(formData.orderIndex) ? formData.orderIndex : 1
    };

    setSubmitting(true);
    const action = isEditing ? updateMutation : createMutation;
    action
      .mutateAsync(payload)
      .catch((error: any) => {
        toast.error(readErrorMessage(error));
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <>
      <form onSubmit={handleSubmit} className='w-full space-y-8'>
        <Tabs defaultValue='en' className='w-full'>
          <TabsList>
            <TabsTrigger value='en'>English</TabsTrigger>
            <TabsTrigger value='km'>Khmer</TabsTrigger>
          </TabsList>

          <TabsContent value='en' className='mt-6'>
            <div className='flex flex-col gap-6 md:flex-row'>
              <div className='w-full space-y-2 md:flex-1'>
                <Label htmlFor='title-en'>Title</Label>
                <Textarea
                  id='title-en'
                  placeholder='Youth Group'
                  value={formData.title.en}
                  onChange={(e) =>
                    updateLocalizedField('title', 'en', e.target.value)
                  }
                />
              </div>

              <div className='w-full space-y-2 md:flex-1'>
                <Label htmlFor='description-en'>Description</Label>
                <Textarea
                  id='description-en'
                  rows={4}
                  className='resize-none'
                  placeholder='Focus on outreach'
                  value={formData.description.en}
                  onChange={(e) =>
                    updateLocalizedField('description', 'en', e.target.value)
                  }
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value='km' className='mt-6'>
            <div className='flex flex-col gap-6 md:flex-row'>
              <div className='w-full space-y-2 md:flex-1'>
                <Label htmlFor='title-km'>Title</Label>
                <Textarea
                  id='title-km'
                  placeholder='ក្រុមយុវជន'
                  value={formData.title.km}
                  onChange={(e) =>
                    updateLocalizedField('title', 'km', e.target.value)
                  }
                />
              </div>

              <div className='w-full space-y-2 md:flex-1'>
                <Label htmlFor='description-km'>Description</Label>
                <Textarea
                  id='description-km'
                  rows={4}
                  className='resize-none'
                  placeholder='ក្រុមយុវជន'
                  value={formData.description.km}
                  onChange={(e) =>
                    updateLocalizedField('description', 'km', e.target.value)
                  }
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className='border-border grid gap-6 border-t pt-6 md:grid-cols-2'>
          <div className='space-y-2'>
            <div className='flex items-center justify-between gap-2'>
              <Label htmlFor='icon-url'>Icon URL</Label>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setIconPickerOpen(true)}
              >
                Select from Media
              </Button>
            </div>
            <Input
              id='icon-url'
              placeholder='https://example.com/icon.png'
              value={formData.iconUrl}
              onChange={(e) => {
                setIconPreviewError(false);
                setFormData((prev) => ({ ...prev, iconUrl: e.target.value }));
              }}
            />
            {iconPreviewUrl ? (
              <div className='bg-muted mt-3 flex h-24 w-24 items-center justify-center overflow-hidden rounded-md border'>
                {iconPreviewError ? (
                  <span className='text-muted-foreground px-2 text-center text-xs'>
                    Invalid image URL
                  </span>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={iconPreviewUrl}
                    alt='Icon preview'
                    className='h-full w-full object-cover'
                    onError={() => setIconPreviewError(true)}
                  />
                )}
              </div>
            ) : null}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='order-index'>Order Index</Label>
            <Input
              id='order-index'
              type='number'
              min={1}
              value={formData.orderIndex}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  orderIndex: Number.parseInt(e.target.value, 10) || 1
                }))
              }
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='status'>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  status: value as WorkingGroupFormData['status']
                }))
              }
            >
              <SelectTrigger id='status'>
                <SelectValue placeholder='Select status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='draft'>Draft</SelectItem>
                <SelectItem value='published'>Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='page'>Page (optional)</Label>
            <Select
              value={formData.pageId || 'none'}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  pageId: value === 'none' ? '' : value
                }))
              }
            >
              <SelectTrigger id='page'>
                <SelectValue placeholder='Select page (optional)' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='none'>No page</SelectItem>
                {pages.map((page) => (
                  <SelectItem
                    key={page.id}
                    value={page.id}
                    disabled={page.isUsed}
                  >
                    {page.label}
                    {page.isUsed ? ' (Already linked)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className='text-muted-foreground text-xs'>
              Each page can be linked to only one working group.
            </p>
          </div>
        </div>

        <div className='mt-6 flex items-center justify-end gap-3 pt-6'>
          <Button
            type='button'
            variant='outline'
            onClick={() => router.push('/admin/working-group')}
          >
            Cancel
          </Button>
          <Button variant='primary' type='submit' disabled={submitting}>
            {isEditing ? 'Save Changes' : 'Save'}
          </Button>
        </div>
      </form>

      <FileModal
        isOpen={iconPickerOpen}
        onClose={() => setIconPickerOpen(false)}
        onSelect={handleSelectIconFromMedia}
        onUploadFromDevice={handleUploadIconFromDevice}
        loading={iconUploadLoading}
        title='Select icon image'
        description='Upload a new image or pick from Media Manager.'
        types={['image']}
        accept='image/*'
      />
    </>
  );
}
