'use client';

import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileModal } from '@/components/modal/file-modal';
import { useTranslate } from '@/hooks/use-translate';
import type { MediaFile } from '@/features/media/types/media-type';
import { resolveApiAssetUrl } from '@/lib/asset-url';
import { handleImageUpload } from '@/lib/tiptap-utils';
import { ImageIcon, Link2, Plus, X } from 'lucide-react';

export interface HeroBannerData {
  title: {
    en: string;
    km: string;
  };
  subtitle: {
    en: string;
    km: string;
  };
  description: {
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

export const createEmptyBannerData = (): HeroBannerData => ({
  title: {
    en: '',
    km: ''
  },
  subtitle: {
    en: '',
    km: ''
  },
  description: {
    en: '',
    km: ''
  },
  backgroundImages: [],
  ctas: []
});

type BannerFormProps = {
  language: 'en' | 'km';
  value?: HeroBannerData;
  onChange?: (value: HeroBannerData) => void;
};

const normalizeBannerData = (value?: HeroBannerData): HeroBannerData => {
  if (!value || typeof value !== 'object') return createEmptyBannerData();
  return {
    title: {
      en: value.title?.en ?? '',
      km: value.title?.km ?? ''
    },
    subtitle: {
      en: value.subtitle?.en ?? '',
      km: value.subtitle?.km ?? ''
    },
    description: {
      en: value.description?.en ?? '',
      km: value.description?.km ?? ''
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

export function BannerForm({ language, value, onChange }: BannerFormProps) {
  const { t } = useTranslate();
  const qc = useQueryClient();
  const [formData, setFormData] = useState<HeroBannerData>(() =>
    normalizeBannerData(value)
  );
  const [imagePickerIndex, setImagePickerIndex] = useState<number | null>(null);
  const [uploadingFromDevice, setUploadingFromDevice] = useState(false);
  const lastValue = useRef<string>('');
  const pendingEmit = useRef<HeroBannerData | null>(null);

  useEffect(() => {
    if (!value) return;
    const serialized = JSON.stringify(value);
    if (serialized === lastValue.current) return;
    lastValue.current = serialized;
    setFormData(normalizeBannerData(value));
  }, [value]);

  useEffect(() => {
    if (!pendingEmit.current) return;
    onChange?.(pendingEmit.current);
    pendingEmit.current = null;
  }, [formData, onChange]);

  const updateForm = (updater: (prev: HeroBannerData) => HeroBannerData) => {
    setFormData((prev) => {
      const next = updater(prev);
      pendingEmit.current = next;
      lastValue.current = JSON.stringify(next);
      return next;
    });
  };

  const updateField = (path: string, value: string) => {
    updateForm((prev) => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current: Record<string, unknown> = newData as unknown as Record<
        string,
        unknown
      >;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        const next = (current[key] as Record<string, unknown>) || {};
        const cloned = { ...next };
        current[key] = cloned;
        current = cloned;
      }

      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const addImage = () => {
    updateForm((prev) => ({
      ...prev,
      backgroundImages: [...prev.backgroundImages, '']
    }));
  };

  const updateImage = (index: number, value: string) => {
    updateForm((prev) => ({
      ...prev,
      backgroundImages: prev.backgroundImages.map((img, i) =>
        i === index ? value : img
      )
    }));
  };

  const removeImage = (index: number) => {
    updateForm((prev) => ({
      ...prev,
      backgroundImages: prev.backgroundImages.filter((_, i) => i !== index)
    }));
  };

  const handleSelectBackgroundFromMedia = (file: MediaFile) => {
    if (imagePickerIndex === null) return;
    const selectedUrl = (file.url ?? '').trim();
    if (!selectedUrl) return;
    updateImage(imagePickerIndex, selectedUrl);
  };

  const handleUploadBackgroundFromDevice = async (
    files: File[],
    folderId?: string | null
  ) => {
    const firstFile = files[0];
    const targetIndex = imagePickerIndex;
    if (!firstFile || targetIndex === null) return;

    setUploadingFromDevice(true);
    try {
      const normalizedFolderId = String(folderId ?? '').trim();
      const result = await handleImageUpload(
        firstFile,
        undefined,
        undefined,
        normalizedFolderId || undefined
      );
      const uploadedUrl = (result?.url ?? '').trim();

      if (!uploadedUrl) {
        throw new Error(
          t('post.blocks.heroBanner.backgroundImageUploadMissingUrl')
        );
      }

      updateImage(targetIndex, uploadedUrl);
      await qc.invalidateQueries({ queryKey: ['media'], exact: false });
      toast.success(t('post.blocks.heroBanner.backgroundImageUploaded'));
    } catch (error: any) {
      toast.error(
        error?.message ||
          t('post.blocks.heroBanner.backgroundImageUploadFailed')
      );
    } finally {
      setUploadingFromDevice(false);
    }
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

  const updateCtaLabel = (index: number, lang: 'en' | 'km', value: string) => {
    updateForm((prev) => ({
      ...prev,
      ctas: prev.ctas.map((cta, i) =>
        i === index ? { ...cta, label: { ...cta.label, [lang]: value } } : cta
      )
    }));
  };

  const updateCtaHref = (index: number, value: string) => {
    updateForm((prev) => ({
      ...prev,
      ctas: prev.ctas.map((cta, i) =>
        i === index ? { ...cta, href: value } : cta
      )
    }));
  };

  const removeCta = (index: number) => {
    updateForm((prev) => ({
      ...prev,
      ctas: prev.ctas.filter((_, i) => i !== index)
    }));
  };

  const isKhmer = language === 'km';

  return (
    <div className='space-y-6'>
      {/* Title, Subtitle & Description Section */}
      <Card>
        <CardContent className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='title'>
                {t('post.blocks.heroBanner.headline')}
              </Label>
              <Input
                id='title'
                value={isKhmer ? formData.title.km : formData.title.en}
                onChange={(e) =>
                  updateField(`title.${language}`, e.target.value)
                }
                placeholder={
                  isKhmer
                    ? t('post.blocks.heroBanner.enterTitleKhmer')
                    : t('post.blocks.heroBanner.enterTitleEnglish')
                }
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='subtitle'>
                {t('post.blocks.heroBanner.subHeadline')}
              </Label>
              <Input
                id='subtitle'
                value={isKhmer ? formData.subtitle.km : formData.subtitle.en}
                onChange={(e) =>
                  updateField(`subtitle.${language}`, e.target.value)
                }
                placeholder={
                  isKhmer
                    ? t('post.blocks.heroBanner.enterSubtitleKhmer')
                    : t('post.blocks.heroBanner.enterSubtitleEnglish')
                }
              />
            </div>
            <div className='space-y-2 md:col-span-2'>
              <Label htmlFor='description'>
                {t('post.blocks.heroBanner.description')}
              </Label>
              <Textarea
                id='description'
                value={
                  isKhmer ? formData.description.km : formData.description.en
                }
                onChange={(e) =>
                  updateField(`description.${language}`, e.target.value)
                }
                placeholder={
                  isKhmer
                    ? t('post.blocks.heroBanner.enterDescriptionKhmer')
                    : t('post.blocks.heroBanner.enterDescriptionEnglish')
                }
                rows={4}
                className='resize-none'
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Background Images Section */}
      <Card>
        <CardHeader className='border-b'>
          <CardTitle className='flex items-center justify-between'>
            <span className='flex items-center gap-2'>
              <ImageIcon className='size-5' />
              {t('post.blocks.heroBanner.backgroundImages')}
            </span>
          </CardTitle>
          <CardAction>
            <Button type='button' size='sm' onClick={addImage}>
              <Plus className='mr-1 size-4' />
              {t('post.blocks.heroBanner.addImage')}
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
                  <Label
                    htmlFor={`backgroundImage-${index}`}
                  >{`${t('post.blocks.heroBanner.imageUrl')} ${index + 1}`}</Label>
                  <div className='flex items-center gap-2'>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => setImagePickerIndex(index)}
                    >
                      {t('post.blocks.heroBanner.chooseFromMedia')}
                    </Button>
                    {formData.backgroundImages.length > 1 && (
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='text-destructive hover:bg-destructive/10 hover:text-destructive h-7 w-7'
                        onClick={() => removeImage(index)}
                      >
                        <X className='size-4' />
                      </Button>
                    )}
                  </div>
                </div>
                <div className='space-y-3'>
                  {/* Keep hero banner images media-only so users do not need
                      to paste raw URLs by hand. */}
                  {image ? (
                    <div className='bg-muted relative aspect-video w-full max-w-sm overflow-hidden rounded-lg border'>
                      <Image
                        src={previewUrl || '/placeholder.svg'}
                        alt={`Banner preview ${index + 1}`}
                        fill
                        unoptimized
                        className='object-cover'
                      />
                    </div>
                  ) : (
                    <div className='text-muted-foreground flex min-h-28 items-center justify-center rounded-lg border border-dashed text-sm'>
                      {/* Show a simple empty state until the user picks an image
                          from Media Manager or uploads one from the modal. */}
                      {t('post.blocks.heroBanner.noImageSelected')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {formData.backgroundImages.length === 0 && (
            <div className='text-muted-foreground flex flex-col items-center justify-center rounded-lg border border-dashed py-8'>
              <ImageIcon className='mb-2 size-8' />
              <p>{t('post.blocks.heroBanner.noImagesAdded')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CTA Buttons */}
      <Card>
        <CardHeader className='border-b'>
          <CardTitle className='flex items-center gap-2'>
            <Link2 className='size-5' />
            {t('post.blocks.heroBanner.ctaButtons')}
          </CardTitle>
          <CardDescription>
            {t('post.blocks.heroBanner.ctaDescription')}
          </CardDescription>
          <CardAction>
            <Button type='button' size='sm' onClick={addCta}>
              <Plus className='mr-1 size-4' />
              {t('post.blocks.heroBanner.addButton')}
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
                <Label>{`${t('post.blocks.heroBanner.button')} ${index + 1}`}</Label>
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
                  <Label htmlFor={`cta-label-${index}`}>
                    {isKhmer
                      ? t('post.blocks.heroBanner.buttonLabelKhmer')
                      : t('post.blocks.heroBanner.buttonLabelEnglish')}
                  </Label>
                  <Input
                    id={`cta-label-${index}`}
                    value={isKhmer ? cta.label.km : cta.label.en}
                    onChange={(e) =>
                      updateCtaLabel(index, language, e.target.value)
                    }
                    placeholder={
                      isKhmer
                        ? t('post.blocks.heroBanner.enterButtonLabelKhmer')
                        : t('post.blocks.heroBanner.enterButtonLabelEnglish')
                    }
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor={`cta-href-${index}`}>
                    {t('post.blocks.heroBanner.linkUrl')}
                  </Label>
                  <Input
                    id={`cta-href-${index}`}
                    value={cta.href}
                    onChange={(e) => updateCtaHref(index, e.target.value)}
                    placeholder='/'
                  />
                </div>
              </div>
            </div>
          ))}
          {formData.ctas.length === 0 && (
            <div className='text-muted-foreground flex flex-col items-center justify-center rounded-lg border border-dashed py-8'>
              <Link2 className='mb-2 size-8' />
              <p>{t('post.blocks.heroBanner.noButtons')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <FileModal
        isOpen={imagePickerIndex !== null}
        onClose={() => setImagePickerIndex(null)}
        onSelect={handleSelectBackgroundFromMedia}
        onUploadFromDevice={handleUploadBackgroundFromDevice}
        loading={uploadingFromDevice}
        title={t('post.blocks.heroBanner.selectBackgroundImage')}
        description={t(
          'post.blocks.heroBanner.selectBackgroundImageDescription'
        )}
        types={['image']}
        accept='image/*'
        allowUploadFromDevice
      />
    </div>
  );
}
