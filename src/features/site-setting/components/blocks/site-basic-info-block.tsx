'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Image as ImageIcon } from 'lucide-react';
import { FileModal } from '@/components/modal/file-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { resolveApiAssetUrl } from '@/lib/asset-url';
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

function MediaPickerField({
  label,
  value,
  onChoose,
  onClear
}: MediaPickerFieldProps) {
  const previewUrl = useMemo(() => resolveApiAssetUrl(value), [value]);

  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between gap-2'>
        <Label>{label}</Label>
        <div className='flex items-center gap-2'>
          <Button type='button' size='sm' variant='outline' onClick={onChoose}>
            Choose file
          </Button>
          {value ? (
            <Button type='button' size='sm' variant='ghost' onClick={onClear}>
              Clear
            </Button>
          ) : null}
        </div>
      </div>

      {previewUrl ? (
        <div className='relative h-60 w-full max-w-md overflow-hidden rounded-md border'>
          <Image
            src={previewUrl}
            alt={`${label} preview`}
            fill
            unoptimized
            className='object-cover'
          />
        </div>
      ) : (
        <div className='text-muted-foreground bg-muted/30 flex h-40 w-full max-w-md items-center justify-center rounded-md border border-dashed text-sm'>
          <ImageIcon className='mr-2 h-4 w-4' />
          No image selected
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
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);

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

  return (
    <>
      <Card>
        <CardContent className='space-y-6'>
          <div className='space-y-2'>
            <Label>{`Site Title (${localeSuffix})`}</Label>
            <Input
              value={titleValue}
              onChange={(event) =>
                onLocalizedChange('title', activeLocale, event.target.value)
              }
              placeholder={
                activeLocale === 'en'
                  ? 'Enter site title in English'
                  : 'បញ្ចូលចំណងជើងគេហទំព័រជាភាសាខ្មែរ'
              }
            />
          </div>

          <div className='space-y-2'>
            <Label>{`Site Description (${localeSuffix})`}</Label>
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
                  ? 'Enter site description in English'
                  : 'បញ្ចូលពិពណ៌នាគេហទំព័រជាភាសាខ្មែរ'
              }
              className='min-h-[96px]'
            />
          </div>

          <div className='space-y-4'>
            <MediaPickerField
              label='Site Logo'
              value={logo}
              onChoose={() => setPickerTarget('logo')}
              onClear={() => onMediaChange('logo', '')}
            />

            <MediaPickerField
              label='Footer Background'
              value={footerBackground}
              onChoose={() => setPickerTarget('footerBackground')}
              onClear={() => onMediaChange('footerBackground', '')}
            />
          </div>

          <div className='space-y-2'>
            <Label>{`Address (${localeSuffix})`}</Label>
            <Textarea
              value={addressValue}
              onChange={(event) =>
                onLocalizedChange('address', activeLocale, event.target.value)
              }
              placeholder={
                activeLocale === 'en'
                  ? 'Enter address in English'
                  : 'បញ្ចូលអាសយដ្ឋានជាភាសាខ្មែរ'
              }
              className='min-h-[96px]'
            />
          </div>

          <div className='space-y-2'>
            <Label>{`Open Time (${localeSuffix})`}</Label>
            <Textarea
              value={openTimeValue}
              onChange={(event) =>
                onLocalizedChange('openTime', activeLocale, event.target.value)
              }
              placeholder={
                activeLocale === 'en'
                  ? 'Enter open time in English'
                  : 'បញ្ចូលម៉ោងបើកជាភាសាខ្មែរ'
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
        title={
          pickerTarget === 'logo'
            ? 'Select Logo Image'
            : 'Select Footer Background'
        }
        description='Choose an image from Media Manager.'
        types={['image']}
        accept='image/*'
        allowUploadFromDevice={false}
      />
    </>
  );
}
