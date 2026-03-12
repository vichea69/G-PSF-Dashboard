'use client';

import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FileModal } from '@/components/modal/file-modal';
import type { MediaFile } from '@/features/media/types/media-type';
import { resolveApiAssetUrl } from '@/lib/asset-url';
import { ImageIcon, Link2, Plus, Send, X } from 'lucide-react';

export interface SubmissionFormData {
  title: {
    en: string;
    km: string;
  };
  backgroundImages: string[];
  ctas: {
    label: {
      en: string;
      km: string;
    };
    href: string;
  }[];
}

export const createEmptySubmissionFormData = (): SubmissionFormData => ({
  title: {
    en: '',
    km: ''
  },
  backgroundImages: [],
  ctas: []
});

const normalizeSubmissionFormData = (
  value?: SubmissionFormData
): SubmissionFormData => {
  if (!value || typeof value !== 'object') {
    return createEmptySubmissionFormData();
  }

  return {
    title: {
      en: value.title?.en ?? '',
      km: value.title?.km ?? ''
    },
    backgroundImages: Array.isArray(value.backgroundImages)
      ? value.backgroundImages.filter((item) => typeof item === 'string')
      : [],
    ctas: Array.isArray(value.ctas)
      ? value.ctas.map((cta) => ({
          label: {
            en: cta?.label?.en ?? '',
            km: cta?.label?.km ?? ''
          },
          href: cta?.href ?? ''
        }))
      : []
  };
};

type SubmissionFormProps = {
  language: 'en' | 'km';
  value?: SubmissionFormData;
  onChange?: (value: SubmissionFormData) => void;
};

export function SubmissionForm({
  language,
  value,
  onChange
}: SubmissionFormProps) {
  const [formData, setFormData] = useState<SubmissionFormData>(() =>
    normalizeSubmissionFormData(value)
  );
  const [imagePickerIndex, setImagePickerIndex] = useState<number | null>(null);
  const lastValue = useRef<string>('');
  const pendingEmit = useRef<SubmissionFormData | null>(null);
  const isKhmer = language === 'km';

  useEffect(() => {
    if (!value) return;
    const serialized = JSON.stringify(value);
    if (serialized === lastValue.current) return;
    lastValue.current = serialized;
    setFormData(normalizeSubmissionFormData(value));
  }, [value]);

  useEffect(() => {
    if (!pendingEmit.current) return;
    onChange?.(pendingEmit.current);
    pendingEmit.current = null;
  }, [formData, onChange]);

  const updateForm = (
    updater: (prev: SubmissionFormData) => SubmissionFormData
  ) => {
    setFormData((prev) => {
      const next = updater(prev);
      pendingEmit.current = next;
      lastValue.current = JSON.stringify(next);
      return next;
    });
  };

  const updateTitle = (nextTitle: string) => {
    updateForm((prev) => ({
      ...prev,
      title: {
        ...prev.title,
        [language]: nextTitle
      }
    }));
  };

  const addImage = () => {
    updateForm((prev) => ({
      ...prev,
      backgroundImages: [...prev.backgroundImages, '']
    }));
  };

  const updateImage = (index: number, nextImage: string) => {
    updateForm((prev) => ({
      ...prev,
      backgroundImages: prev.backgroundImages.map((image, imageIndex) =>
        imageIndex === index ? nextImage : image
      )
    }));
  };

  const removeImage = (index: number) => {
    updateForm((prev) => ({
      ...prev,
      backgroundImages: prev.backgroundImages.filter(
        (_, imageIndex) => imageIndex !== index
      )
    }));
  };

  const handleSelectBackgroundFromMedia = (file: MediaFile) => {
    if (imagePickerIndex === null) return;
    const selectedUrl = (file.url ?? '').trim();
    if (!selectedUrl) return;
    updateImage(imagePickerIndex, selectedUrl);
  };

  const addCta = () => {
    updateForm((prev) => ({
      ...prev,
      ctas: [
        ...prev.ctas,
        {
          label: { en: '', km: '' },
          href: ''
        }
      ]
    }));
  };

  const updateCtaLabel = (index: number, nextLabel: string) => {
    updateForm((prev) => ({
      ...prev,
      ctas: prev.ctas.map((cta, ctaIndex) =>
        ctaIndex === index
          ? {
              ...cta,
              label: {
                ...cta.label,
                [language]: nextLabel
              }
            }
          : cta
      )
    }));
  };

  const updateCtaHref = (index: number, nextHref: string) => {
    updateForm((prev) => ({
      ...prev,
      ctas: prev.ctas.map((cta, ctaIndex) =>
        ctaIndex === index ? { ...cta, href: nextHref } : cta
      )
    }));
  };

  const removeCta = (index: number) => {
    updateForm((prev) => ({
      ...prev,
      ctas: prev.ctas.filter((_, ctaIndex) => ctaIndex !== index)
    }));
  };

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader className='border-b'>
          <CardTitle className='flex items-center gap-2'>
            <Send className='size-5' />
            Submission Form
          </CardTitle>
        </CardHeader>

        <CardContent className='space-y-2'>
          <Label htmlFor='submission-form-title'>
            {isKhmer ? 'Title (Khmer)' : 'Title (English)'}
          </Label>
          <Input
            id='submission-form-title'
            value={isKhmer ? formData.title.km : formData.title.en}
            onChange={(event) => updateTitle(event.target.value)}
            placeholder={
              isKhmer ? 'Enter title in Khmer' : 'Enter title in English'
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='border-b'>
          <CardTitle className='flex items-center gap-2'>
            <ImageIcon className='size-5' />
            Background Images
          </CardTitle>
          <CardAction>
            <Button type='button' size='sm' onClick={addImage}>
              <Plus className='mr-1 size-4' />
              Add Image
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className='space-y-4'>
          {formData.backgroundImages.map((image, index) => {
            const previewUrl = resolveApiAssetUrl(image);

            return (
              <div
                key={index}
                className='bg-muted/20 space-y-3 rounded-lg border p-4'
              >
                <div className='flex items-center justify-between gap-2'>
                  <Label htmlFor={`submission-background-image-${index}`}>
                    {`Image URL ${index + 1}`}
                  </Label>
                  <div className='flex items-center gap-2'>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => setImagePickerIndex(index)}
                    >
                      Choose from Media
                    </Button>
                    {formData.backgroundImages.length > 1 ? (
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='text-destructive hover:bg-destructive/10 hover:text-destructive h-7 w-7'
                        onClick={() => removeImage(index)}
                      >
                        <X className='size-4' />
                      </Button>
                    ) : null}
                  </div>
                </div>

                <div className='flex flex-col gap-4 md:flex-row md:items-start'>
                  <Input
                    id={`submission-background-image-${index}`}
                    value={image}
                    onChange={(event) => updateImage(index, event.target.value)}
                    placeholder='https://example.com/image.jpg'
                  />

                  {image ? (
                    <div className='bg-muted relative aspect-video w-full max-w-sm overflow-hidden rounded-lg border'>
                      <Image
                        src={previewUrl || '/placeholder.svg'}
                        alt={`Submission preview ${index + 1}`}
                        fill
                        unoptimized
                        className='object-cover'
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}

          {formData.backgroundImages.length === 0 ? (
            <div className='text-muted-foreground flex flex-col items-center justify-center rounded-lg border border-dashed py-8'>
              <ImageIcon className='mb-2 size-8' />
              <p>No images added. Click Add Image to start.</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='border-b'>
          <CardTitle className='flex items-center gap-2'>
            <Link2 className='size-5' />
            CTA Buttons
          </CardTitle>
          <CardDescription>Manage the buttons for this form.</CardDescription>
          <CardAction>
            <Button type='button' size='sm' onClick={addCta}>
              <Plus className='mr-1 size-4' />
              Add Button
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent className='space-y-4'>
          {formData.ctas.map((cta, index) => (
            <div
              key={index}
              className='bg-muted/20 space-y-3 rounded-lg border p-4'
            >
              <div className='flex items-center justify-between gap-2'>
                <Label>{`Button ${index + 1}`}</Label>
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='text-destructive hover:bg-destructive/10 hover:text-destructive h-7 w-7'
                  onClick={() => removeCta(index)}
                >
                  <X className='size-4' />
                </Button>
              </div>

              <div className='grid gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor={`submission-cta-label-${index}`}>
                    {isKhmer
                      ? 'Button Label (Khmer)'
                      : 'Button Label (English)'}
                  </Label>
                  <Input
                    id={`submission-cta-label-${index}`}
                    value={isKhmer ? cta.label.km : cta.label.en}
                    onChange={(event) =>
                      updateCtaLabel(index, event.target.value)
                    }
                    placeholder={
                      isKhmer
                        ? 'Enter button label in Khmer'
                        : 'Enter button label in English'
                    }
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor={`submission-cta-href-${index}`}>
                    Link URL
                  </Label>
                  <Input
                    id={`submission-cta-href-${index}`}
                    value={cta.href}
                    onChange={(event) =>
                      updateCtaHref(index, event.target.value)
                    }
                    placeholder='/'
                  />
                </div>
              </div>
            </div>
          ))}

          {formData.ctas.length === 0 ? (
            <div className='text-muted-foreground flex flex-col items-center justify-center rounded-lg border border-dashed py-8'>
              <Link2 className='mb-2 size-8' />
              <p>No buttons added. Click Add Button to start.</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <FileModal
        isOpen={imagePickerIndex !== null}
        onClose={() => setImagePickerIndex(null)}
        onSelect={handleSelectBackgroundFromMedia}
        title='Select background image'
        description='Choose an image from Media Manager.'
        types={['image']}
        accept='image/*'
        allowUploadFromDevice={false}
      />
    </div>
  );
}
