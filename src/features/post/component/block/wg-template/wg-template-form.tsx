'use client';

import Image from 'next/image';
import { useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ImageIcon, Users, X } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
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

type LocalizedTextValue = {
  en: string;
  km: string;
};

export interface WgTemplateRepresentativePersonData {
  name: LocalizedTextValue;
  description: LocalizedTextValue;
  photo: string;
}

export interface WgTemplateRepresentativeData {
  sectorRepresentative: WgTemplateRepresentativePersonData;
  governmentRepresentative: WgTemplateRepresentativePersonData;
}

type RepresentativeKey = keyof WgTemplateRepresentativeData;

const createEmptyLocalizedTextValue = (): LocalizedTextValue => ({
  en: '',
  km: ''
});

const createEmptyRepresentativePerson =
  (): WgTemplateRepresentativePersonData => ({
    name: createEmptyLocalizedTextValue(),
    description: createEmptyLocalizedTextValue(),
    photo: ''
  });

export const createEmptyWgTemplateRepresentativeData =
  (): WgTemplateRepresentativeData => ({
    sectorRepresentative: createEmptyRepresentativePerson(),
    governmentRepresentative: createEmptyRepresentativePerson()
  });

export const createEmptyWgTemplateData = (): WgTemplateData => ({
  heroBanner: createEmptyBannerData(),
  textBlock: createEmptyTextBlockData(),
  progressSnapshot: createEmptyProgressSnapshotData(),
  submissionForm: createEmptySubmissionFormData(),
  issuesResponses: createEmptyIssuesResponsesData(),
  representative: createEmptyWgTemplateRepresentativeData()
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object';

const readString = (value: unknown) => (typeof value === 'string' ? value : '');

const normalizeLocalizedTextValue = (value: unknown): LocalizedTextValue => {
  if (!isRecord(value)) return createEmptyLocalizedTextValue();

  return {
    en: readString(value.en),
    km: readString(value.km)
  };
};

const normalizeRepresentativePerson = (
  value: unknown,
  legacyName: unknown,
  legacyDescription: unknown,
  legacyPhoto: unknown
): WgTemplateRepresentativePersonData => {
  const record = isRecord(value) ? value : {};

  return {
    name: normalizeLocalizedTextValue(record.name ?? legacyName),
    description: normalizeLocalizedTextValue(
      record.description ?? legacyDescription
    ),
    photo: readString(record.photo ?? legacyPhoto)
  };
};

const normalizeRepresentativeData = (
  value?: unknown
): WgTemplateRepresentativeData => {
  if (!isRecord(value)) return createEmptyWgTemplateRepresentativeData();

  const legacyPhotos = Array.isArray(value.photos)
    ? value.photos.filter((item): item is string => typeof item === 'string')
    : [];

  return {
    governmentRepresentative: normalizeRepresentativePerson(
      value.governmentRepresentative,
      value.governmentRepresentative,
      value.governmentRepresentativeDescription,
      legacyPhotos[0] ?? ''
    ),
    sectorRepresentative: normalizeRepresentativePerson(
      value.sectorRepresentative,
      value.sectorRepresentative,
      value.sectorRepresentativeDescription,
      legacyPhotos[1] ?? legacyPhotos[0] ?? ''
    )
  };
};

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
  const [photoPickerTarget, setPhotoPickerTarget] =
    useState<RepresentativeKey | null>(null);
  const [uploadingFromDevice, setUploadingFromDevice] = useState(false);
  const isKhmer = language === 'km';

  const updateRepresentativeText = (
    key: RepresentativeKey,
    field: 'name' | 'description',
    text: string
  ) => {
    onChange({
      ...value,
      [key]: {
        ...value[key],
        [field]: {
          ...value[key][field],
          [language]: text
        }
      }
    });
  };

  const updateRepresentativePhoto = (key: RepresentativeKey, photo: string) => {
    onChange({
      ...value,
      [key]: {
        ...value[key],
        photo
      }
    });
  };

  const openPhotoPicker = (key: RepresentativeKey) => {
    setPhotoPickerTarget(key);
    setIsPhotoPickerOpen(true);
  };

  const handleSelectPhoto = (file: MediaFile) => {
    if (!photoPickerTarget) return;

    const selectedUrl = (file.url ?? '').trim();
    if (!selectedUrl) return;

    updateRepresentativePhoto(photoPickerTarget, selectedUrl);
  };

  const handleUploadPhoto = async (files: File[], folderId?: string | null) => {
    const firstFile = files[0];
    if (!firstFile || !photoPickerTarget) return;

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
        throw new Error(t('post.blocks.wgTemplate.photoUploadMissingUrl'));
      }

      updateRepresentativePhoto(photoPickerTarget, uploadedUrl);

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

  const representatives: Array<{
    key: RepresentativeKey;
    title: string;
    namePlaceholder: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
  }> = [
    {
      key: 'governmentRepresentative',
      title: isKhmer
        ? t('post.blocks.wgTemplate.governmentRepresentativeKh')
        : t('post.blocks.wgTemplate.governmentRepresentativeEn'),
      namePlaceholder: isKhmer
        ? t('post.blocks.wgTemplate.governmentRepresentativePlaceholderKh')
        : t('post.blocks.wgTemplate.governmentRepresentativePlaceholderEn'),
      descriptionLabel: isKhmer
        ? t('post.blocks.wgTemplate.governmentDescriptionKh')
        : t('post.blocks.wgTemplate.governmentDescriptionEn'),
      descriptionPlaceholder: isKhmer
        ? t('post.blocks.wgTemplate.governmentDescriptionPlaceholderKh')
        : t('post.blocks.wgTemplate.governmentDescriptionPlaceholderEn')
    },
    {
      key: 'sectorRepresentative',
      title: isKhmer
        ? t('post.blocks.wgTemplate.sectorRepresentativeKh')
        : t('post.blocks.wgTemplate.sectorRepresentativeEn'),
      namePlaceholder: isKhmer
        ? t('post.blocks.wgTemplate.sectorRepresentativePlaceholderKh')
        : t('post.blocks.wgTemplate.sectorRepresentativePlaceholderEn'),
      descriptionLabel: isKhmer
        ? t('post.blocks.wgTemplate.sectorDescriptionKh')
        : t('post.blocks.wgTemplate.sectorDescriptionEn'),
      descriptionPlaceholder: isKhmer
        ? t('post.blocks.wgTemplate.sectorDescriptionPlaceholderKh')
        : t('post.blocks.wgTemplate.sectorDescriptionPlaceholderEn')
    }
  ];

  return (
    <Card>
      <CardHeader className='border-b'>
        <CardTitle className='flex items-center gap-2'>
          <Users className='size-5' />
          {t('post.blocks.wgTemplate.meetingDetails')}
        </CardTitle>
      </CardHeader>

      <CardContent className='space-y-5 pt-6'>
        <div className='grid gap-4'>
          {representatives.map((item) => {
            const representative = value[item.key];
            const previewUrl = resolveApiAssetUrl(representative.photo);

            return (
              <div key={item.key} className='space-y-4 rounded-xl border p-4'>
                <div className='space-y-2'>
                  <Label htmlFor={`${item.key}-name`}>{item.title}</Label>
                  <Input
                    id={`${item.key}-name`}
                    value={representative.name[language]}
                    onChange={(event) =>
                      updateRepresentativeText(
                        item.key,
                        'name',
                        event.target.value
                      )
                    }
                    placeholder={item.namePlaceholder}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor={`${item.key}-description`}>
                    {item.descriptionLabel}
                  </Label>
                  <Textarea
                    id={`${item.key}-description`}
                    value={representative.description[language]}
                    onChange={(event) =>
                      updateRepresentativeText(
                        item.key,
                        'description',
                        event.target.value
                      )
                    }
                    placeholder={item.descriptionPlaceholder}
                    rows={4}
                    className='resize-none'
                  />
                </div>

                <div className='space-y-3'>
                  <div className='flex items-center justify-between gap-3'>
                    <Label>
                      {item.title} {t('post.blocks.wgTemplate.photo')}
                    </Label>
                    {representative.photo ? (
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='text-destructive hover:bg-destructive/10 hover:text-destructive'
                        onClick={() => updateRepresentativePhoto(item.key, '')}
                      >
                        <X className='mr-1 size-4' />
                        {t('post.blocks.wgTemplate.clearPhoto')}
                      </Button>
                    ) : null}
                  </div>

                  {previewUrl ? (
                    <div className='bg-muted/30 relative h-40 w-full max-w-sm overflow-hidden rounded-lg border'>
                      <Image
                        src={previewUrl}
                        alt={`${item.title} ${t('post.blocks.wgTemplate.photo')}`}
                        fill
                        unoptimized
                        className='object-contain'
                      />
                    </div>
                  ) : (
                    <div className='text-muted-foreground flex h-40 w-full max-w-sm items-center justify-center rounded-lg border border-dashed text-sm'>
                      <ImageIcon className='mr-2 size-4' />
                      {t('post.blocks.wgTemplate.noPhotoSelected')}
                    </div>
                  )}

                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => openPhotoPicker(item.key)}
                  >
                    {t('post.blocks.wgTemplate.chooseFromMedia')}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>

      <FileModal
        isOpen={isPhotoPickerOpen}
        onClose={() => {
          setIsPhotoPickerOpen(false);
          setPhotoPickerTarget(null);
        }}
        title={t('post.blocks.wgTemplate.selectPhoto')}
        description={t('post.blocks.wgTemplate.selectPhotoDescription')}
        onSelect={handleSelectPhoto}
        onUploadFromDevice={handleUploadPhoto}
        loading={uploadingFromDevice}
        types={['image']}
        accept='image/*'
        multiple={false}
        allowUploadFromDevice
      />
    </Card>
  );
}
