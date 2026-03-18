'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { FileText, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { FileModal } from '@/components/modal/file-modal';
import { useTranslate } from '@/hooks/use-translate';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { MediaFile } from '@/features/media/types/media-type';
import type { LocalizedPostDocuments } from '@/features/post/component/post-form-types';
import { resolveApiAssetUrl } from '@/lib/asset-url';
import { handleImageUpload } from '@/lib/tiptap-utils';

type DocumentLocale = 'en' | 'km';

type PostResourcesCardProps = {
  coverImage: string;
  documents?: LocalizedPostDocuments;
  document?: string;
  documentThumbnail?: string;
  link: string;
  activeLanguage: DocumentLocale;
  onCoverImageChange: (value: string) => void;
  onDocumentsChange?: (value: LocalizedPostDocuments) => void;
  onDocumentChange?: (value: string) => void;
  onDocumentThumbnailChange?: (value: string) => void;
  onLinkChange: (value: string) => void;
};

type PickerTarget = 'coverImage' | 'document' | null;

type DocumentEntry = {
  url: string;
  thumbnailUrl: string;
};

type NormalizedDocuments = Record<DocumentLocale, DocumentEntry>;

type DocumentPreviewProps = {
  label: string;
  documentUrl: string;
  thumbnailUrl: string;
  onChoose: () => void;
  onClear: () => void;
  chooseLabel: string;
  clearLabel: string;
  selectedDocumentLabel: string;
  previewNotAvailableLabel: string;
  openDocumentLabel: string;
  noDocumentSelectedLabel: string;
};

const getFileNameFromUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const withoutParams = trimmed.split('?')[0].split('#')[0];
  const fileName = withoutParams.split('/').filter(Boolean).at(-1) ?? '';
  if (!fileName) return trimmed;
  try {
    return decodeURIComponent(fileName);
  } catch {
    return fileName;
  }
};

const normalizeDocumentEntry = (
  value?: { url?: string; thumbnailUrl?: string } | null
): DocumentEntry => ({
  url: value?.url?.trim() || '',
  thumbnailUrl: value?.thumbnailUrl?.trim() || ''
});

const compactDocuments = (
  value: NormalizedDocuments
): LocalizedPostDocuments => {
  const toPayload = (entry: DocumentEntry) => {
    const url = entry.url.trim();
    const thumbnailUrl = entry.thumbnailUrl.trim();
    if (!url && !thumbnailUrl) return undefined;
    return {
      ...(url ? { url } : {}),
      ...(thumbnailUrl ? { thumbnailUrl } : {})
    };
  };

  const en = toPayload(value.en);
  const km = toPayload(value.km);

  return {
    ...(en ? { en } : {}),
    ...(km ? { km } : {})
  };
};

function DocumentPreview({
  label,
  documentUrl,
  thumbnailUrl,
  onChoose,
  onClear,
  chooseLabel,
  clearLabel,
  selectedDocumentLabel,
  previewNotAvailableLabel,
  openDocumentLabel,
  noDocumentSelectedLabel
}: DocumentPreviewProps) {
  const documentPreviewUrl = useMemo(
    () => resolveApiAssetUrl(documentUrl),
    [documentUrl]
  );
  const thumbnailPreviewUrl = useMemo(
    () => resolveApiAssetUrl(thumbnailUrl),
    [thumbnailUrl]
  );
  const documentName = useMemo(
    () => getFileNameFromUrl(documentUrl),
    [documentUrl]
  );

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between gap-2'>
        <Label>{label}</Label>
        <div className='flex items-center gap-2'>
          <Button type='button' variant='outline' size='sm' onClick={onChoose}>
            {chooseLabel}
          </Button>
          {documentUrl ? (
            <Button type='button' variant='ghost' size='sm' onClick={onClear}>
              {clearLabel}
            </Button>
          ) : null}
        </div>
      </div>

      {documentPreviewUrl ? (
        <div className='space-y-2 rounded-md border p-3'>
          <p className='flex items-center gap-2 text-sm font-medium'>
            <FileText className='h-4 w-4' />
            {documentName || selectedDocumentLabel}
          </p>
          {thumbnailPreviewUrl ? (
            <div className='relative h-40 w-full max-w-xs overflow-hidden rounded border'>
              <Image
                src={thumbnailPreviewUrl}
                alt={`${label} thumbnail`}
                fill
                unoptimized
                className='object-contain'
              />
            </div>
          ) : (
            <div className='text-muted-foreground bg-muted/40 rounded border p-3 text-sm'>
              {previewNotAvailableLabel}
            </div>
          )}
          <Button asChild variant='outline' size='sm' className='w-fit'>
            <a href={documentPreviewUrl} target='_blank' rel='noreferrer'>
              {openDocumentLabel}
            </a>
          </Button>
        </div>
      ) : (
        <div className='text-muted-foreground rounded-md border border-dashed p-3 text-sm'>
          {noDocumentSelectedLabel}
        </div>
      )}
    </div>
  );
}

export function PostResourcesCard({
  coverImage,
  documents,
  document = '',
  documentThumbnail = '',
  link,
  activeLanguage,
  onCoverImageChange,
  onDocumentsChange,
  onDocumentChange,
  onDocumentThumbnailChange,
  onLinkChange
}: PostResourcesCardProps) {
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);
  const [uploadingFromDevice, setUploadingFromDevice] = useState(false);
  const qc = useQueryClient();
  const { t } = useTranslate();

  const coverPreviewUrl = useMemo(
    () => resolveApiAssetUrl(coverImage),
    [coverImage]
  );
  const coverImageName = useMemo(
    () => getFileNameFromUrl(coverImage),
    [coverImage]
  );

  const normalizedDocuments = useMemo<NormalizedDocuments>(() => {
    const enDocument = normalizeDocumentEntry(documents?.en);
    const kmDocument = normalizeDocumentEntry(documents?.km);
    const hasLocalizedDocuments = Boolean(
      enDocument.url ||
        enDocument.thumbnailUrl ||
        kmDocument.url ||
        kmDocument.thumbnailUrl
    );

    return {
      en: {
        url: enDocument.url || (hasLocalizedDocuments ? '' : document.trim()),
        thumbnailUrl:
          enDocument.thumbnailUrl ||
          (hasLocalizedDocuments ? '' : documentThumbnail.trim())
      },
      km: kmDocument
    };
  }, [documents, document, documentThumbnail]);

  const applyDocumentChange = (locale: DocumentLocale, next: DocumentEntry) => {
    const nextDocuments: NormalizedDocuments = {
      ...normalizedDocuments,
      [locale]: next
    };

    onDocumentsChange?.(compactDocuments(nextDocuments));

    if (locale === 'en') {
      onDocumentChange?.(next.url);
      onDocumentThumbnailChange?.(next.thumbnailUrl);
    }
  };

  const handleSelectFromMedia = (file: MediaFile) => {
    const selectedUrl = (file.url ?? '').trim();
    if (!selectedUrl) return;

    if (pickerTarget === 'coverImage') {
      onCoverImageChange(selectedUrl);
      return;
    }

    if (pickerTarget === 'document') {
      applyDocumentChange(activeLanguage, {
        url: selectedUrl,
        thumbnailUrl: (file.thumbnail ?? '').trim()
      });
    }
  };

  const handleUploadFromDevice = async (
    files: File[],
    folderId?: string | null
  ) => {
    const firstFile = files[0];
    if (!firstFile || !pickerTarget) return;

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
        throw new Error('Upload succeeded but no URL was returned');
      }

      if (pickerTarget === 'coverImage') {
        onCoverImageChange(uploadedUrl);
      } else {
        applyDocumentChange(activeLanguage, {
          url: uploadedUrl,
          thumbnailUrl: (result?.metadata?.thumbnail ?? '').trim()
        });
      }

      await qc.invalidateQueries({ queryKey: ['media'], exact: false });
      toast.success(t('post.resources.uploadedSuccess'));
    } catch (error: any) {
      toast.error(error?.message || t('post.resources.uploadFailed'));
    } finally {
      setUploadingFromDevice(false);
    }
  };

  const activeDocumentLabel =
    activeLanguage === 'en'
      ? t('post.resources.documentFileEn')
      : t('post.resources.documentFileKm');
  const pickerLabel = activeLanguage === 'en' ? 'EN' : 'KM';

  return (
    <Card>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <div className='flex items-center justify-between gap-2'>
            <Label>{t('post.resources.coverImage')}</Label>
            <div className='flex items-center gap-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setPickerTarget('coverImage')}
              >
                {t('post.resources.chooseFile')}
              </Button>
              {coverImage ? (
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() => onCoverImageChange('')}
                >
                  {t('post.resources.clear')}
                </Button>
              ) : null}
            </div>
          </div>
          {coverPreviewUrl ? (
            <div className='overflow-hidden rounded-md border'>
              <div className='bg-muted flex items-center gap-2 border-b px-3 py-2 text-xs font-medium'>
                <ImageIcon className='h-3.5 w-3.5' />
                {coverImageName || t('post.resources.coverImageSelected')}
              </div>
              <div className='relative h-40 w-full max-w-xs'>
                <Image
                  src={coverPreviewUrl}
                  alt='Cover image preview'
                  fill
                  unoptimized
                  className='object-cover'
                />
              </div>
            </div>
          ) : (
            <div className='text-muted-foreground rounded-md border border-dashed p-3 text-sm'>
              {t('post.resources.noCoverImageSelected')}
            </div>
          )}
        </div>

        <div className='space-y-4'>
          <DocumentPreview
            label={activeDocumentLabel}
            documentUrl={normalizedDocuments[activeLanguage].url}
            thumbnailUrl={normalizedDocuments[activeLanguage].thumbnailUrl}
            onChoose={() => setPickerTarget('document')}
            onClear={() =>
              applyDocumentChange(activeLanguage, {
                url: '',
                thumbnailUrl: ''
              })
            }
            chooseLabel={t('post.resources.chooseFile')}
            clearLabel={t('post.resources.clear')}
            selectedDocumentLabel={t('post.resources.selectedDocument')}
            previewNotAvailableLabel={t('post.resources.previewNotAvailable')}
            openDocumentLabel={t('post.resources.openDocument')}
            noDocumentSelectedLabel={t('post.resources.noDocumentSelected')}
          />
        </div>

        <div>
          <Label htmlFor='external-link'>{t('post.resources.link')}</Label>
          <Input
            id='external-link'
            value={link}
            onChange={(event) => onLinkChange(event.target.value)}
            placeholder={t('post.resources.linkPlaceholder')}
            className='mt-1'
          />
        </div>
      </CardContent>

      <FileModal
        isOpen={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        onSelect={handleSelectFromMedia}
        onUploadFromDevice={handleUploadFromDevice}
        loading={uploadingFromDevice}
        title={
          pickerTarget === 'coverImage'
            ? t('post.resources.selectCoverImage')
            : `${t('post.resources.selectDocument')} (${pickerLabel})`
        }
        description={t('post.resources.chooseFromMediaDescription')}
        types={pickerTarget === 'coverImage' ? ['image'] : ['pdf', 'document']}
        accept={pickerTarget === 'coverImage' ? 'image/*' : '*/*'}
        allowUploadFromDevice
      />
    </Card>
  );
}
