'use client';

import Image from 'next/image';
import { useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ImageIcon, Plus, Users, X } from 'lucide-react';
import { useTranslate } from '@/hooks/use-translate';
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
import { FileModal } from '@/components/modal/file-modal';
import type { MediaFile } from '@/features/media/types/media-type';
import { resolveApiAssetUrl } from '@/lib/asset-url';
import { handleImageUpload } from '@/lib/tiptap-utils';
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
import {
  IssuesResponsesForm,
  createEmptyIssuesResponsesData,
  type IssuesResponsesData
} from '@/features/post/component/block/issues-responses/issues-responses-form';
import {
  ProgressSnapshotForm,
  createEmptyProgressSnapshotData,
  type ProgressSnapshotData
} from '@/features/post/component/block/progress-snapshot/progress-snapshot-form';
import {
  SubmissionForm,
  createEmptySubmissionFormData,
  type SubmissionFormData
} from '@/features/post/component/block/submission-form/submission-form';

export interface WgTemplateData {
  heroBanner: HeroBannerData;
  textBlock: TextBlockData;
  progressSnapshot: ProgressSnapshotData;
  submissionForm: SubmissionFormData;
  issuesResponses: IssuesResponsesData;
  representative: WgTemplateRepresentativeData;
}

export interface WgTemplateRepresentativeData {
  sectorRepresentative: {
    en: string;
    km: string;
  };
  governmentRepresentative: {
    en: string;
    km: string;
  };
  photos: string[];
}

export const createEmptyWgTemplateRepresentativeData =
  (): WgTemplateRepresentativeData => ({
    sectorRepresentative: {
      en: '',
      km: ''
    },
    governmentRepresentative: {
      en: '',
      km: ''
    },
    photos: []
  });

export const createEmptyWgTemplateData = (): WgTemplateData => ({
  heroBanner: createEmptyBannerData(),
  textBlock: createEmptyTextBlockData(),
  progressSnapshot: createEmptyProgressSnapshotData(),
  submissionForm: createEmptySubmissionFormData(),
  issuesResponses: createEmptyIssuesResponsesData(),
  representative: createEmptyWgTemplateRepresentativeData()
});

const normalizeRepresentativeData = (
  value?: WgTemplateRepresentativeData
): WgTemplateRepresentativeData => ({
  sectorRepresentative: {
    en: value?.sectorRepresentative?.en ?? '',
    km: value?.sectorRepresentative?.km ?? ''
  },
  governmentRepresentative: {
    en: value?.governmentRepresentative?.en ?? '',
    km: value?.governmentRepresentative?.km ?? ''
  },
  photos: Array.isArray(value?.photos)
    ? value.photos.filter((item): item is string => typeof item === 'string')
    : []
});

const normalizeWgTemplateData = (value?: WgTemplateData): WgTemplateData => {
  const fallback = createEmptyWgTemplateData();

  if (!value || typeof value !== 'object') {
    return fallback;
  }

  const legacyValue = value as WgTemplateData & {
    meetingDetails?: WgTemplateRepresentativeData;
  };
  const legacyRepresentative =
    legacyValue.meetingDetails && typeof legacyValue.meetingDetails === 'object'
      ? legacyValue.meetingDetails
      : undefined;

  return {
    heroBanner:
      value.heroBanner && typeof value.heroBanner === 'object'
        ? value.heroBanner
        : fallback.heroBanner,
    textBlock:
      value.textBlock && typeof value.textBlock === 'object'
        ? value.textBlock
        : fallback.textBlock,
    progressSnapshot:
      value.progressSnapshot && typeof value.progressSnapshot === 'object'
        ? value.progressSnapshot
        : fallback.progressSnapshot,
    submissionForm:
      value.submissionForm && typeof value.submissionForm === 'object'
        ? value.submissionForm
        : fallback.submissionForm,
    issuesResponses:
      value.issuesResponses && typeof value.issuesResponses === 'object'
        ? value.issuesResponses
        : fallback.issuesResponses,
    representative:
      value.representative && typeof value.representative === 'object'
        ? normalizeRepresentativeData(value.representative)
        : legacyRepresentative
          ? normalizeRepresentativeData(legacyRepresentative)
          : fallback.representative
  };
};

type WgTemplateFormProps = {
  language: 'en' | 'km';
  value?: WgTemplateData;
  onChange?: (value: WgTemplateData) => void;
};

type WgTemplateSectionProps = {
  value: string;
  title: string;
  children: ReactNode;
};

function WgTemplateSection({ value, title, children }: WgTemplateSectionProps) {
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

export function WgTemplateForm({
  language,
  value,
  onChange
}: WgTemplateFormProps) {
  const { t } = useTranslate();
  const formData = normalizeWgTemplateData(value);

  return (
    <Accordion
      type='single'
      collapsible
      defaultValue='hero-banner'
      className='space-y-4'
    >
      <WgTemplateSection
        value='hero-banner'
        title={t('post.blocks.wgTemplate.heroBanner')}
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
      </WgTemplateSection>

      <WgTemplateSection
        value='mandate-scope'
        title={t('post.blocks.wgTemplate.mandateScope')}
      >
        <TextBlockForm
          language={language}
          value={formData.textBlock}
          cardTitle={t('post.blocks.wgTemplate.mandateScope')}
          descriptionInput='tiptap'
          onChange={(nextTextBlock) =>
            onChange?.({
              ...formData,
              textBlock: nextTextBlock
            })
          }
        />
      </WgTemplateSection>

      <WgTemplateSection
        value='meeting-details'
        title={t('post.blocks.wgTemplate.meetingDetails')}
      >
        <RepresentativeForm
          language={language}
          value={formData.representative}
          onChange={(nextRepresentative) =>
            onChange?.({
              ...formData,
              representative: nextRepresentative
            })
          }
        />
      </WgTemplateSection>

      <WgTemplateSection
        value='progress-snapshot'
        title={t('post.blocks.wgTemplate.progressSnapshot')}
      >
        <ProgressSnapshotForm
          value={formData.progressSnapshot}
          onChange={(nextProgressSnapshot) =>
            onChange?.({
              ...formData,
              progressSnapshot: nextProgressSnapshot
            })
          }
        />
      </WgTemplateSection>

      <WgTemplateSection
        value='issues-responses'
        title={t('post.blocks.wgTemplate.issuesResponses')}
      >
        <IssuesResponsesForm
          language={language}
          value={formData.issuesResponses}
          onChange={(nextIssuesResponses) =>
            onChange?.({
              ...formData,
              issuesResponses: nextIssuesResponses
            })
          }
        />
      </WgTemplateSection>

      <WgTemplateSection
        value='submission-form'
        title={t('post.blocks.wgTemplate.submissionForm')}
      >
        <SubmissionForm
          language={language}
          value={formData.submissionForm}
          onChange={(nextSubmissionForm) =>
            onChange?.({
              ...formData,
              submissionForm: nextSubmissionForm
            })
          }
        />
      </WgTemplateSection>
    </Accordion>
  );
}

function RepresentativeForm({
  language,
  value,
  onChange
}: {
  language: 'en' | 'km';
  value: WgTemplateRepresentativeData;
  onChange: (value: WgTemplateRepresentativeData) => void;
}) {
  const { t } = useTranslate();
  const qc = useQueryClient();
  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);
  const [photoPickerIndex, setPhotoPickerIndex] = useState<number | null>(null);
  const [photoPickerMode, setPhotoPickerMode] = useState<'append' | 'replace'>(
    'append'
  );
  const [uploadingFromDevice, setUploadingFromDevice] = useState(false);
  const isKhmer = language === 'km';

  const updateRepresentative = (
    key: 'sectorRepresentative' | 'governmentRepresentative',
    text: string
  ) => {
    onChange({
      ...value,
      [key]: {
        ...value[key],
        [language]: text
      }
    });
  };

  const appendPhotos = (photos: string[]) => {
    if (!photos.length) return;
    onChange({
      ...value,
      photos: [...value.photos, ...photos]
    });
  };

  const updatePhoto = (index: number, nextPhoto: string) => {
    onChange({
      ...value,
      photos: value.photos.map((photo, photoIndex) =>
        photoIndex === index ? nextPhoto : photo
      )
    });
  };

  const removePhoto = (index: number) => {
    onChange({
      ...value,
      photos: value.photos.filter((_, photoIndex) => photoIndex !== index)
    });
  };

  const handleSelectPhoto = (file: MediaFile) => {
    const selectedUrl = (file.url ?? '').trim();
    if (!selectedUrl) return;

    if (photoPickerMode === 'replace' && photoPickerIndex !== null) {
      updatePhoto(photoPickerIndex, selectedUrl);
      return;
    }

    appendPhotos([selectedUrl]);
  };

  const handleSelectMultiplePhotos = (files: MediaFile[]) => {
    const selectedUrls = files
      .map((file) => (file.url ?? '').trim())
      .filter(Boolean);

    appendPhotos(selectedUrls);
  };

  const handleUploadPhoto = async (files: File[], folderId?: string | null) => {
    if (!files.length) return;

    setUploadingFromDevice(true);
    try {
      const normalizedFolderId = String(folderId ?? '').trim();
      const uploadedUrls = (
        await Promise.all(
          files.map(async (file) => {
            const result = await handleImageUpload(
              file,
              undefined,
              undefined,
              normalizedFolderId || undefined
            );
            return (result?.url ?? '').trim();
          })
        )
      ).filter(Boolean);

      if (!uploadedUrls.length) {
        throw new Error(t('post.blocks.wgTemplate.photoUploadMissingUrl'));
      }

      if (photoPickerMode === 'replace' && photoPickerIndex !== null) {
        updatePhoto(photoPickerIndex, uploadedUrls[0]);
      } else {
        appendPhotos(uploadedUrls);
      }

      await qc.invalidateQueries({ queryKey: ['media'], exact: false });
      toast.success(t('post.blocks.wgTemplate.photoUploaded'));
    } catch (error: any) {
      toast.error(
        error?.message || t('post.blocks.wgTemplate.photoUploadFailed')
      );
    } finally {
      setUploadingFromDevice(false);
    }
  };

  return (
    <Card>
      <CardHeader className='border-b'>
        <CardTitle className='flex items-center gap-2'>
          <Users className='size-5' />
          {t('post.blocks.wgTemplate.meetingDetails')}
        </CardTitle>
      </CardHeader>

      <CardContent className='space-y-5 pt-6'>
        <div className='grid gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <Label htmlFor='government-representative'>
              {isKhmer
                ? t('post.blocks.wgTemplate.governmentRepresentativeKh')
                : t('post.blocks.wgTemplate.governmentRepresentativeEn')}
            </Label>
            <Input
              id='government-representative'
              value={
                isKhmer
                  ? value.governmentRepresentative.km
                  : value.governmentRepresentative.en
              }
              onChange={(event) =>
                updateRepresentative(
                  'governmentRepresentative',
                  event.target.value
                )
              }
              placeholder={
                isKhmer
                  ? t(
                      'post.blocks.wgTemplate.governmentRepresentativePlaceholderKh'
                    )
                  : t(
                      'post.blocks.wgTemplate.governmentRepresentativePlaceholderEn'
                    )
              }
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='sector-representative'>
              {isKhmer
                ? t('post.blocks.wgTemplate.sectorRepresentativeKh')
                : t('post.blocks.wgTemplate.sectorRepresentativeEn')}
            </Label>
            <Input
              id='sector-representative'
              value={
                isKhmer
                  ? value.sectorRepresentative.km
                  : value.sectorRepresentative.en
              }
              onChange={(event) =>
                updateRepresentative('sectorRepresentative', event.target.value)
              }
              placeholder={
                isKhmer
                  ? t(
                      'post.blocks.wgTemplate.sectorRepresentativePlaceholderKh'
                    )
                  : t(
                      'post.blocks.wgTemplate.sectorRepresentativePlaceholderEn'
                    )
              }
            />
          </div>
        </div>

        <div className='space-y-3'>
          <div className='flex items-center justify-between gap-3'>
            <div className='space-y-1'>
              <Label>{t('post.blocks.wgTemplate.photos')}</Label>
              <p className='text-muted-foreground text-sm'>
                {/* {t('post.blocks.wgTemplate.photosHelp')} */}
              </p>
            </div>
            <Button
              type='button'
              size='sm'
              onClick={() => {
                setPhotoPickerMode('append');
                setPhotoPickerIndex(null);
                setIsPhotoPickerOpen(true);
              }}
            >
              <Plus className='mr-1 size-4' />
              {t('post.blocks.wgTemplate.addPhoto')}
            </Button>
          </div>

          {value.photos.length ? (
            <div className='space-y-4'>
              {value.photos.map((photo, index) => {
                const previewUrl = resolveApiAssetUrl(photo);

                return (
                  <div
                    key={`${photo || 'photo'}-${index}`}
                    className='space-y-3 rounded-xl border p-4'
                  >
                    <div className='flex items-start justify-between gap-3'>
                      <div className='min-w-0'>
                        <p className='text-sm font-medium'>
                          {t('post.blocks.wgTemplate.photo')} {index + 1}
                        </p>
                      </div>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8'
                        onClick={() => removePhoto(index)}
                      >
                        <X className='size-4' />
                      </Button>
                    </div>

                    {previewUrl ? (
                      <div className='relative aspect-[16/9] overflow-hidden rounded-lg border'>
                        <Image
                          src={previewUrl}
                          alt={`${t('post.blocks.wgTemplate.photo')} ${index + 1}`}
                          fill
                          unoptimized
                          className='object-cover'
                        />
                      </div>
                    ) : (
                      <div className='text-muted-foreground flex aspect-[16/9] items-center justify-center rounded-lg border border-dashed text-sm'>
                        <ImageIcon className='mr-2 size-4' />
                        {t('post.blocks.wgTemplate.noPhotoSelected')}
                      </div>
                    )}

                    <div className='flex flex-wrap gap-2'>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          setPhotoPickerMode('replace');
                          setPhotoPickerIndex(index);
                          setIsPhotoPickerOpen(true);
                        }}
                      >
                        {t('post.blocks.wgTemplate.chooseFromMedia')}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className='text-muted-foreground rounded-xl border border-dashed px-4 py-8 text-center text-sm'>
              {t('post.blocks.wgTemplate.noPhotosAdded')}
            </div>
          )}
        </div>
      </CardContent>

      <FileModal
        isOpen={isPhotoPickerOpen}
        onClose={() => {
          setIsPhotoPickerOpen(false);
          setPhotoPickerIndex(null);
          setPhotoPickerMode('append');
        }}
        title={t('post.blocks.wgTemplate.selectPhoto')}
        description={t('post.blocks.wgTemplate.selectPhotoDescription')}
        onSelect={handleSelectPhoto}
        onSelectMultiple={handleSelectMultiplePhotos}
        onUploadFromDevice={handleUploadPhoto}
        loading={uploadingFromDevice}
        types={['image']}
        accept='image/*'
        multiple={photoPickerMode === 'append'}
        allowUploadFromDevice
      />
    </Card>
  );
}
