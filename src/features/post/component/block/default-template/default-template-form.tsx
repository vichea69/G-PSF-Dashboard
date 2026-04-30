'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ImageIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileModal } from '@/components/modal/file-modal';
import type { MediaFile } from '@/features/media/types/media-type';
import {
  BannerForm,
  createEmptyBannerData,
  type HeroBannerData
} from '@/features/post/component/block/hero-banner/hero-banner-form';
import {
  TextBlockForm,
  createEmptyTextBlockData,
  type TextBlockData
} from '@/features/post/component/block/text-block/text-block-form';
import { useTranslate } from '@/hooks/use-translate';
import { resolveApiAssetUrl } from '@/lib/asset-url';
import { handleImageUpload } from '@/lib/tiptap-utils';

export interface ImageShowcaseData {
  title: {
    en: string;
    km: string;
  };
  description: {
    en: string;
    km: string;
  };
  image: string;
}

export interface DefaultTemplateData {
  heroBanner: HeroBannerData;
  textBlock: TextBlockData;
  imageShowcase: ImageShowcaseData;
}

export const createEmptyImageShowcaseData = (): ImageShowcaseData => ({
  title: {
    en: '',
    km: ''
  },
  description: {
    en: '',
    km: ''
  },
  image: ''
});

export const createEmptyDefaultTemplateData = (): DefaultTemplateData => ({
  heroBanner: createEmptyBannerData(),
  textBlock: createEmptyTextBlockData(),
  imageShowcase: createEmptyImageShowcaseData()
});

const normalizeImageShowcaseData = (
  value?: ImageShowcaseData
): ImageShowcaseData => ({
  title: {
    en: value?.title?.en ?? '',
    km: value?.title?.km ?? ''
  },
  description: {
    en: value?.description?.en ?? '',
    km: value?.description?.km ?? ''
  },
  image: value?.image ?? ''
});

const normalizeDefaultTemplateData = (
  value?: DefaultTemplateData
): DefaultTemplateData => {
  const fallback = createEmptyDefaultTemplateData();

  if (!value || typeof value !== 'object') {
    return fallback;
  }

  return {
    heroBanner:
      value.heroBanner && typeof value.heroBanner === 'object'
        ? value.heroBanner
        : fallback.heroBanner,
    textBlock:
      value.textBlock && typeof value.textBlock === 'object'
        ? value.textBlock
        : fallback.textBlock,
    imageShowcase:
      value.imageShowcase && typeof value.imageShowcase === 'object'
        ? normalizeImageShowcaseData(value.imageShowcase)
        : fallback.imageShowcase
  };
};

type DefaultTemplateFormProps = {
  language: 'en' | 'km';
  value?: DefaultTemplateData;
  onChange?: (value: DefaultTemplateData) => void;
};

type DefaultTemplateSectionProps = {
  children: ReactNode;
  title: string;
  value: string;
};

function DefaultTemplateSection({
  children,
  title,
  value
}: DefaultTemplateSectionProps) {
  return (
    <AccordionItem
      value={value}
      className='bg-card border-border/70 overflow-hidden rounded-2xl border shadow-sm'
    >
      <AccordionTrigger className='px-5 py-4 text-base font-semibold hover:no-underline'>
        {title}
      </AccordionTrigger>
      <AccordionContent className='px-5 pb-5'>{children}</AccordionContent>
    </AccordionItem>
  );
}

export function DefaultTemplateForm({
  language,
  value,
  onChange
}: DefaultTemplateFormProps) {
  const { t } = useTranslate();
  const formData = normalizeDefaultTemplateData(value);

  return (
    <Accordion
      type='single'
      collapsible
      defaultValue='hero-banner'
      className='space-y-4'
    >
      <DefaultTemplateSection
        value='hero-banner'
        title={t('post.blocks.defaultTemplate.heroBanner')}
      >
        <BannerForm
          language={language}
          value={formData.heroBanner}
          onChange={(nextHeroBanner) =>
            onChange?.({
              ...formData,
              heroBanner: nextHeroBanner
            })
          }
        />
      </DefaultTemplateSection>

      <DefaultTemplateSection
        value='text-block'
        title={t('post.blocks.defaultTemplate.textBlock')}
      >
        <TextBlockForm
          language={language}
          value={formData.textBlock}
          cardTitle={t('post.blocks.defaultTemplate.textBlock')}
          onChange={(nextTextBlock) =>
            onChange?.({
              ...formData,
              textBlock: nextTextBlock
            })
          }
        />
      </DefaultTemplateSection>

      <DefaultTemplateSection
        value='image-showcase'
        title={t('post.blocks.defaultTemplate.imageShowcase')}
      >
        <ImageShowcaseForm
          language={language}
          value={formData.imageShowcase}
          onChange={(nextImageShowcase) =>
            onChange?.({
              ...formData,
              imageShowcase: nextImageShowcase
            })
          }
        />
      </DefaultTemplateSection>
    </Accordion>
  );
}

function ImageShowcaseForm({
  language,
  value,
  onChange
}: {
  language: 'en' | 'km';
  value: ImageShowcaseData;
  onChange: (value: ImageShowcaseData) => void;
}) {
  const { t } = useTranslate();
  const qc = useQueryClient();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [uploadingFromDevice, setUploadingFromDevice] = useState(false);
  const isKhmer = language === 'km';
  const previewUrl = resolveApiAssetUrl(value.image);

  const updateLocalizedField = (
    field: 'title' | 'description',
    text: string
  ) => {
    onChange({
      ...value,
      [field]: {
        ...value[field],
        [language]: text
      }
    });
  };

  const updateImage = (image: string) => {
    onChange({
      ...value,
      image
    });
  };

  const handleSelectImage = (file: MediaFile) => {
    const selectedUrl = (file.url ?? '').trim();
    if (!selectedUrl) return;
    updateImage(selectedUrl);
  };

  const handleUploadFromDevice = async (
    files: File[],
    folderId?: string | null
  ) => {
    const firstFile = files[0];
    if (!firstFile) return;

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
        throw new Error(t('post.blocks.defaultTemplate.imageUploadMissingUrl'));
      }

      updateImage(uploadedUrl);
      await qc.invalidateQueries({ queryKey: ['media'], exact: false });
      toast.success(t('post.blocks.defaultTemplate.imageUploaded'));
    } catch (error: any) {
      toast.error(
        error?.message || t('post.blocks.defaultTemplate.imageUploadFailed')
      );
    } finally {
      setUploadingFromDevice(false);
    }
  };

  return (
    <Card className='gap-4 border-0 bg-transparent py-0 shadow-none'>
      <CardHeader className='px-0 pb-0'>
        <CardTitle className='flex items-center gap-2'>
          <ImageIcon className='size-5' />
          {t('post.blocks.defaultTemplate.imageShowcase')}
        </CardTitle>
      </CardHeader>

      <CardContent className='space-y-4 px-0'>
        <div className='grid gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <Label htmlFor='default-template-image-title'>
              {isKhmer
                ? t('post.blocks.defaultTemplate.titleKhmer')
                : t('post.blocks.defaultTemplate.titleEnglish')}
            </Label>
            <Input
              id='default-template-image-title'
              value={isKhmer ? value.title.km : value.title.en}
              onChange={(event) =>
                updateLocalizedField('title', event.target.value)
              }
              placeholder={
                isKhmer
                  ? t('post.blocks.defaultTemplate.enterTitleKhmer')
                  : t('post.blocks.defaultTemplate.enterTitleEnglish')
              }
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='default-template-image'>
              {t('post.blocks.defaultTemplate.image')}
            </Label>
            <div className='flex gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setIsPickerOpen(true)}
              >
                {t('post.blocks.defaultTemplate.chooseFromMedia')}
              </Button>
              {value.image ? (
                <Button
                  type='button'
                  variant='ghost'
                  onClick={() => updateImage('')}
                >
                  {t('post.blocks.defaultTemplate.clear')}
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='default-template-image-description'>
            {isKhmer
              ? t('post.blocks.defaultTemplate.descriptionKhmer')
              : t('post.blocks.defaultTemplate.descriptionEnglish')}
          </Label>
          <Textarea
            id='default-template-image-description'
            value={isKhmer ? value.description.km : value.description.en}
            onChange={(event) =>
              updateLocalizedField('description', event.target.value)
            }
            placeholder={
              isKhmer
                ? t('post.blocks.defaultTemplate.enterDescriptionKhmer')
                : t('post.blocks.defaultTemplate.enterDescriptionEnglish')
            }
            rows={3}
            className='resize-none'
          />
        </div>

        {value.image ? (
          <div className='bg-muted relative aspect-video w-full max-w-lg overflow-hidden rounded-xl border'>
            <Image
              src={previewUrl || '/placeholder.svg'}
              alt={value.title.en || value.title.km || 'Image showcase'}
              fill
              unoptimized
              className='object-contain'
            />
          </div>
        ) : (
          <div className='text-muted-foreground flex min-h-36 items-center justify-center rounded-xl border border-dashed text-sm'>
            {t('post.blocks.defaultTemplate.noImageSelected')}
          </div>
        )}
      </CardContent>

      <FileModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleSelectImage}
        onUploadFromDevice={handleUploadFromDevice}
        loading={uploadingFromDevice}
        title={t('post.blocks.defaultTemplate.selectImage')}
        description={t('post.blocks.defaultTemplate.selectImageDescription')}
        types={['image']}
        accept='image/*'
        allowUploadFromDevice
      />
    </Card>
  );
}
