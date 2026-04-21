'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Image as ImageIcon } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FileModal } from '@/components/modal/file-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslate } from '@/hooks/use-translate';
import { resolveApiAssetUrl } from '@/lib/asset-url';
import { handleImageUpload } from '@/lib/tiptap-utils';
import type { MediaFile } from '@/features/media/types/media-type';
import type {
  LocaleKey,
  LocalizedValue
} from '@/features/site-setting/types/site-setting-types';

type LocalizedFieldKey = 'title' | 'description' | 'address' | 'openTime';
type MediaFieldKey = 'logo' | 'footerBackground';

type SiteBasicInfoBlockProps = {
  activeLocale: LocaleKey;
  title: LocalizedValue;
  description: LocalizedValue;
  address: LocalizedValue;
  openTime: LocalizedValue;
  logo: string;
  footerBackground: string;
  onLocalizedChange: (
    field: LocalizedFieldKey,
    locale: LocaleKey,
    value: string
  ) => void;
  onMediaChange: (field: MediaFieldKey, value: string) => void;
};

type PickerTarget = MediaFieldKey | null;

type MediaPickerFieldProps = {
  label: string;
  value: string;
  onChoose: () => void;
  onClear: () => void;
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

function MediaPickerField({
  label,
  value,
  onChoose,
  onClear
}: MediaPickerFieldProps) {
  const { t } = useTranslate();
  const previewUrl = useMemo(() => resolveApiAssetUrl(value), [value]);
  const fileName = useMemo(() => getFileNameFromUrl(value), [value]);

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between gap-2'>
        <Label>{label}</Label>
        <div className='flex items-center gap-2'>
          <Button type='button' size='sm' variant='outline' onClick={onChoose}>
            {t('siteSetting.basicInfo.chooseFile')}
          </Button>
          {value ? (
            <Button type='button' size='sm' variant='ghost' onClick={onClear}>
              {t('siteSetting.basicInfo.clear')}
            </Button>
          ) : null}
        </div>
      </div>

      {previewUrl ? (
        <div className='overflow-hidden rounded-md border'>
          <div className='bg-muted flex items-center gap-2 border-b px-3 py-2 text-xs font-medium'>
            <ImageIcon className='h-3.5 w-3.5' />
            {fileName || label}
          </div>
          <div className='p-3'>
            {/* Keep the whole image visible and centered, like the post cover preview. */}
            <div className='bg-background relative aspect-[16/9] w-full max-w-sm overflow-hidden rounded-md'>
              <Image
                src={previewUrl}
                alt={`${label} ${t('siteSetting.basicInfo.previewAltSuffix')}`}
                fill
                unoptimized
                className='object-contain p-2'
              />
            </div>
          </div>
        </div>
      ) : (
        <div className='text-muted-foreground bg-muted/30 flex h-40 w-full max-w-md items-center justify-center rounded-md border border-dashed text-sm'>
          <ImageIcon className='mr-2 h-4 w-4' />
          {t('siteSetting.basicInfo.noImageSelected')}
        </div>
      )}
    </div>
  );
}

export function SiteBasicInfoBlock({
  activeLocale,
  title,
  description,
  address,
  openTime,
  logo,
  footerBackground,
  onLocalizedChange,
  onMediaChange
}: SiteBasicInfoBlockProps) {
  const { t } = useTranslate();
  const queryClient = useQueryClient();
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);
  const [uploadingFromDevice, setUploadingFromDevice] = useState(false);

  const localeSuffix = activeLocale === 'en' ? 'EN' : 'KM';
  const titleValue = activeLocale === 'en' ? title.en : title.km;
  const descriptionValue =
    activeLocale === 'en' ? description.en : description.km;
  const addressValue = activeLocale === 'en' ? address.en : address.km;
  const openTimeValue = activeLocale === 'en' ? openTime.en : openTime.km;

  const handleSelectMedia = (file: MediaFile) => {
    if (!pickerTarget) return;
    onMediaChange(pickerTarget, file.url);
  };

  const handleUploadFromDevice = async (
    files: File[],
    folderId?: string | null
  ) => {
    const firstFile = files[0];
    if (!firstFile || !pickerTarget) return;

    setUploadingFromDevice(true);

    try {
      // Reuse the existing media upload helper so the uploaded image
      // goes to the same Media Manager flow as the rest of the app.
      const result = await handleImageUpload(
        firstFile,
        undefined,
        undefined,
        String(folderId ?? '').trim() || undefined
      );

      if (!result?.url) {
        throw new Error(t('siteSetting.basicInfo.uploadMissingUrl'));
      }

      onMediaChange(pickerTarget, result.url);
      await queryClient.invalidateQueries({
        queryKey: ['media'],
        exact: false
      });
      toast.success(t('siteSetting.basicInfo.uploadSuccess'));
    } catch (error: any) {
      toast.error(error?.message ?? t('siteSetting.basicInfo.uploadFailed'));
    } finally {
      setUploadingFromDevice(false);
    }
  };

  return (
    <>
      <Card>
        <CardContent className='space-y-6'>
          <div className='space-y-2'>
            <Label>{`${t('siteSetting.basicInfo.siteTitle')} (${localeSuffix})`}</Label>
            <Input
              value={titleValue}
              onChange={(event) =>
                onLocalizedChange('title', activeLocale, event.target.value)
              }
              placeholder={
                activeLocale === 'en'
                  ? t('siteSetting.basicInfo.titlePlaceholderEn')
                  : t('siteSetting.basicInfo.titlePlaceholderKm')
              }
            />
          </div>

          <div className='space-y-2'>
            <Label>{`${t('siteSetting.basicInfo.siteDescription')} (${localeSuffix})`}</Label>
            <Textarea
              value={descriptionValue}
              onChange={(event) =>
                onLocalizedChange(
                  'description',
                  activeLocale,
                  event.target.value
                )
              }
              placeholder={
                activeLocale === 'en'
                  ? t('siteSetting.basicInfo.descriptionPlaceholderEn')
                  : t('siteSetting.basicInfo.descriptionPlaceholderKm')
              }
              className='min-h-[96px]'
            />
          </div>

          <div className='space-y-4'>
            <MediaPickerField
              label={t('siteSetting.basicInfo.siteLogo')}
              value={logo}
              onChoose={() => setPickerTarget('logo')}
              onClear={() => onMediaChange('logo', '')}
            />

            {/* <MediaPickerField
              label={t('siteSetting.basicInfo.footerBackground')}
              value={footerBackground}
              onChoose={() => setPickerTarget('footerBackground')}
              onClear={() => onMediaChange('footerBackground', '')}
            /> */}
          </div>

          <div className='space-y-2'>
            <Label>{`${t('siteSetting.basicInfo.address')} (${localeSuffix})`}</Label>
            <Textarea
              value={addressValue}
              onChange={(event) =>
                onLocalizedChange('address', activeLocale, event.target.value)
              }
              placeholder={
                activeLocale === 'en'
                  ? t('siteSetting.basicInfo.addressPlaceholderEn')
                  : t('siteSetting.basicInfo.addressPlaceholderKm')
              }
              className='min-h-[96px]'
            />
          </div>

          <div className='space-y-2'>
            <Label>{`${t('siteSetting.basicInfo.openTime')} (${localeSuffix})`}</Label>
            <Textarea
              value={openTimeValue}
              onChange={(event) =>
                onLocalizedChange('openTime', activeLocale, event.target.value)
              }
              placeholder={
                activeLocale === 'en'
                  ? t('siteSetting.basicInfo.openTimePlaceholderEn')
                  : t('siteSetting.basicInfo.openTimePlaceholderKm')
              }
              className='min-h-[96px]'
            />
          </div>
        </CardContent>
      </Card>

      <FileModal
        isOpen={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        onSelect={handleSelectMedia}
        onUploadFromDevice={handleUploadFromDevice}
        loading={uploadingFromDevice}
        title={
          pickerTarget === 'logo'
            ? t('siteSetting.basicInfo.selectLogoImage')
            : t('siteSetting.basicInfo.selectFooterBackground')
        }
        description={t('siteSetting.basicInfo.chooseImageDescription')}
        types={['image']}
        accept='image/*'
        allowUploadFromDevice
      />
    </>
  );
}
