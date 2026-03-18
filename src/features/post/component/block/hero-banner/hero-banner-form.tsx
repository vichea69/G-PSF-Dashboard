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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileModal } from '@/components/modal/file-modal';
import { useTranslate } from '@/hooks/use-translate';
import type { MediaFile } from '@/features/media/types/media-type';
import { resolveApiAssetUrl } from '@/lib/asset-url';
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
  const [formData, setFormData] = useState<HeroBannerData>(() =>
    normalizeBannerData(value)
  );
  const [imagePickerIndex, setImagePickerIndex] = useState<number | null>(null);
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
                <div className='flex flex-col gap-4 md:flex-row md:items-start'>
                  <Input
                    id={`backgroundImage-${index}`}
                    value={image}
                    onChange={(e) => updateImage(index, e.target.value)}
                    placeholder='https://example.com/image.jpg'
                  />
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
                  ) : null}
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
        title={t('post.blocks.heroBanner.selectBackgroundImage')}
        description={t(
          'post.blocks.heroBanner.selectBackgroundImageDescription'
        )}
        types={['image']}
        accept='image/*'
        allowUploadFromDevice={false}
      />
    </div>
  );
}
