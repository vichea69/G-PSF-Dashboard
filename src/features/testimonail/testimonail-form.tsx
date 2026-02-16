'use client';

import React from 'react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, User } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  createTestimonial,
  updateTestimonial
} from '@/server/action/testimonail/testimonail';
import type { LocalizedText } from '@/lib/helpers';
import { FileModal } from '@/components/modal/file-modal';
import type { MediaFile } from '@/features/media/types/media-type';
import { handleImageUpload } from '@/lib/tiptap-utils';

interface TestimonialFormData {
  title: { en: string; km: string };
  quote: { en: string; km: string };
  authorName: { en: string; km: string };
  authorRole: { en: string; km: string };
  company: string;
  rating: number;
  avatarUrl: string;
  status: string;
  orderIndex: number;
}

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

const getLocalizedValue = (
  value: LocalizedText | undefined,
  key: 'en' | 'km'
) => {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return '';
  const candidate = value[key];
  return typeof candidate === 'string' ? candidate : '';
};

export function TestimonialForm({
  initialData
}: {
  initialData?: TestimonialInitialData;
}) {
  const [formData, setFormData] = useState<TestimonialFormData>({
    title: {
      en: getLocalizedValue(initialData?.title, 'en'),
      km: getLocalizedValue(initialData?.title, 'km')
    },
    quote: {
      en: getLocalizedValue(initialData?.quote, 'en'),
      km: getLocalizedValue(initialData?.quote, 'km')
    },
    authorName: {
      en: getLocalizedValue(initialData?.authorName, 'en'),
      km: getLocalizedValue(initialData?.authorName, 'km')
    },
    authorRole: {
      en: getLocalizedValue(initialData?.authorRole, 'en'),
      km: getLocalizedValue(initialData?.authorRole, 'km')
    },
    company: initialData?.company ?? '',
    rating: Number(initialData?.rating ?? 5),
    avatarUrl: initialData?.avatarUrl ?? '',
    status: initialData?.status ?? 'draft',
    orderIndex: Number(initialData?.orderIndex ?? 1) || 1
  });

  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [avatarUploadLoading, setAvatarUploadLoading] = useState(false);
  const [avatarPreviewError, setAvatarPreviewError] = useState(false);
  const qc = useQueryClient();
  const router = useRouter();
  const avatarPreviewUrl = formData.avatarUrl.trim();

  const createMutation = useMutation({
    mutationFn: (payload: TestimonialFormData) => createTestimonial(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['testimonials'] });
      toast.success('Testimonial created successfully');
      router.replace('/admin/testimonial');
    }
  });
  const updateMutation = useMutation({
    mutationFn: (payload: TestimonialFormData) => {
      if (!initialData?.id) {
        throw new Error('Testimonial id is required');
      }
      return updateTestimonial(initialData.id, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['testimonials'] });
      toast.success('Testimonial updated successfully');
      router.replace('/admin/testimonial');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const action = initialData?.id ? updateMutation : createMutation;
    action
      .mutateAsync(formData)
      .catch((error: any) => {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          'Failed to save testimonial';
        toast.error(message);
      })
      .finally(() => setSubmitting(false));
  };

  const updateField = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateLocalizedField = (
    field: keyof Pick<
      TestimonialFormData,
      'title' | 'quote' | 'authorName' | 'authorRole'
    >,
    lang: 'en' | 'km',
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: { ...prev[field], [lang]: value }
    }));
  };

  // Pick avatar from existing Media Manager files.
  const handleSelectAvatarFromMedia = (file: MediaFile) => {
    const selectedUrl = (file.url ?? file.thumbnail ?? '').trim();
    if (!selectedUrl) {
      toast.error('Selected media does not have a valid URL');
      return;
    }

    setAvatarPreviewError(false);
    setFormData((prev) => ({ ...prev, avatarUrl: selectedUrl }));
  };

  // Optional: upload a new avatar file directly from this modal.
  const handleUploadAvatarFromDevice = async (files: File[]) => {
    const firstFile = files[0];
    if (!firstFile) return;

    setAvatarUploadLoading(true);
    try {
      const result = await handleImageUpload(firstFile);
      if (!result?.url) {
        throw new Error('Upload succeeded but no URL was returned');
      }

      setAvatarPreviewError(false);
      setFormData((prev) => ({ ...prev, avatarUrl: result.url }));
      await qc.invalidateQueries({ queryKey: ['media'], exact: false });
      toast.success('Avatar selected successfully');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to upload avatar');
    } finally {
      setAvatarUploadLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className='w-full space-y-8'>
        {/* Language Tabs */}
        <Tabs defaultValue='en' className='w-full'>
          <TabsList>
            <TabsTrigger value='en'>English</TabsTrigger>
            <TabsTrigger value='km'>Khmer</TabsTrigger>
          </TabsList>

          {/* English Tab */}
          <TabsContent value='en' className='mt-6 space-y-6'>
            <div className='space-y-2'>
              <Label htmlFor='title-en'>Title</Label>
              <Input
                id='title-en'
                placeholder='Member Experience'
                value={formData.title.en}
                onChange={(e) =>
                  updateLocalizedField('title', 'en', e.target.value)
                }
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='quote-en'>Quote</Label>
              <Textarea
                id='quote-en'
                placeholder='This program helped our business a lot.'
                rows={4}
                value={formData.quote.en}
                onChange={(e) =>
                  updateLocalizedField('quote', 'en', e.target.value)
                }
                className='resize-none'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='author-name-en'>Author Name</Label>
              <Input
                id='author-name-en'
                placeholder='Author Name'
                value={formData.authorName.en}
                onChange={(e) =>
                  updateLocalizedField('authorName', 'en', e.target.value)
                }
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='author-role-en'>Author Role</Label>
              <Input
                id='author-role-en'
                placeholder='Founder'
                value={formData.authorRole.en}
                onChange={(e) =>
                  updateLocalizedField('authorRole', 'en', e.target.value)
                }
              />
            </div>
          </TabsContent>

          {/* Khmer Tab */}
          <TabsContent value='km' className='mt-6 space-y-6'>
            <div className='space-y-2'>
              <Label htmlFor='title-km'>Title</Label>
              <Input
                id='title-km'
                placeholder='បទពិសោធន៍សមាជិក'
                value={formData.title.km}
                onChange={(e) =>
                  updateLocalizedField('title', 'km', e.target.value)
                }
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='quote-km'>Quote</Label>
              <Textarea
                id='quote-km'
                placeholder='កម្មវិធីនេះបានជួយអាជីវកម្មរបស់យើងច្រើន។'
                rows={4}
                value={formData.quote.km}
                onChange={(e) =>
                  updateLocalizedField('quote', 'km', e.target.value)
                }
                className='resize-none'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='author-name-km'>Author Name</Label>
              <Input
                id='author-name-km'
                placeholder='សុភា'
                value={formData.authorName.km}
                onChange={(e) =>
                  updateLocalizedField('authorName', 'km', e.target.value)
                }
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='author-role-km'>Author Role</Label>
              <Input
                id='author-role-km'
                placeholder='ស្ថាបនិក'
                value={formData.authorRole.km}
                onChange={(e) =>
                  updateLocalizedField('authorRole', 'km', e.target.value)
                }
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Common Fields (outside tabs) */}
        <div className='border-border space-y-6 border-t pt-6'>
          <h3 className='text-sm font-medium'>Author & Settings</h3>

          {/* Avatar */}
          <div className='flex items-start gap-4'>
            <div className='bg-muted flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full'>
              {avatarPreviewUrl ? (
                avatarPreviewError ? (
                  <User className='text-muted-foreground h-6 w-6' />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarPreviewUrl}
                    alt='Avatar preview'
                    className='h-16 w-16 rounded-full object-cover'
                    onError={() => setAvatarPreviewError(true)}
                  />
                )
              ) : (
                <User className='text-muted-foreground h-6 w-6' />
              )}
            </div>
            <div className='flex-1 space-y-3'>
              <div className='space-y-2'>
                <div className='flex items-center justify-between gap-2'>
                  <Label htmlFor='avatar-url'>Avatar URL</Label>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => setAvatarPickerOpen(true)}
                  >
                    Select from Media
                  </Button>
                </div>
                <Input
                  id='avatar-url'
                  placeholder='https://example.com/avatar.jpg'
                  value={formData.avatarUrl}
                  onChange={(e) => {
                    setAvatarPreviewError(false);
                    updateField('avatarUrl', e.target.value);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Company */}
          <div className='space-y-2'>
            <Label htmlFor='company'>Company</Label>
            <Input
              id='company'
              placeholder='ABC Co.'
              value={formData.company}
              onChange={(e) => updateField('company', e.target.value)}
            />
          </div>

          {/* Rating */}
          <div className='space-y-2'>
            <Label>Rating</Label>
            <div className='flex items-center gap-1'>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type='button'
                  onClick={() => updateField('rating', star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className='focus-visible:ring-ring rounded p-1 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2'
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      star <= (hoveredRating || formData.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground/40'
                    }`}
                  />
                </button>
              ))}
              <span className='text-muted-foreground ml-3 text-sm'>
                {formData.rating} out of 5
              </span>
            </div>
          </div>

          {/* Status & Order */}
          <div className='grid gap-6 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='status'>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => updateField('status', value)}
              >
                <SelectTrigger id='status'>
                  <SelectValue placeholder='Select status' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='published'>
                    <span className='flex items-center gap-2'>
                      <span className='h-2 w-2 rounded-full bg-emerald-500' />
                      Published
                    </span>
                  </SelectItem>
                  <SelectItem value='draft'>
                    <span className='flex items-center gap-2'>
                      <span className='bg-muted-foreground h-2 w-2 rounded-full' />
                      Draft
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='order-index'>Order Index</Label>
              <Input
                id='order-index'
                type='number'
                min={1}
                value={formData.orderIndex}
                onChange={(e) =>
                  updateField(
                    'orderIndex',
                    Number.parseInt(e.target.value) || 1
                  )
                }
              />
            </div>
          </div>
        </div>

        {/* Form Actions - Always visible */}
        <div className='mt-6 flex items-center justify-end gap-3 pt-6'>
          <Button
            type='button'
            variant='outline'
            onClick={() => router.push('/admin/testimonial')}
          >
            Cancel
          </Button>
          <Button variant='primary' type='submit' disabled={submitting}>
            {initialData?.id ? 'Save Changes' : 'Save'}
          </Button>
        </div>
      </form>

      <FileModal
        isOpen={avatarPickerOpen}
        onClose={() => setAvatarPickerOpen(false)}
        onSelect={handleSelectAvatarFromMedia}
        onUploadFromDevice={handleUploadAvatarFromDevice}
        loading={avatarUploadLoading}
        title='Select avatar image'
        description='Upload a new image or pick from Media Manager.'
        types={['image']}
        accept='image/*'
      />
    </>
  );
}
export default TestimonialForm;
