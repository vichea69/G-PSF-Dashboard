'use client';

import type { ReactNode } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Users, X } from 'lucide-react';
import { useState } from 'react';
import { FileModal } from '@/components/modal/file-modal';
import type { MediaFile } from '@/features/media/types/media-type';
import { resolveApiAssetUrl } from '@/lib/asset-url';
import Image from 'next/image';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { handleImageUpload } from '@/lib/tiptap-utils';

export interface WgCoChairsData {
  items: {
    profileUrl: string;
    name: {
      en: string;
      km: string;
    };
    description: {
      en: string;
      km: string;
    };
  }[];
}

export const createEmptyWgCoChairsData = (): WgCoChairsData => ({
  items: []
});

const normalizeWgCoChairsData = (value?: WgCoChairsData): WgCoChairsData => {
  if (!value || typeof value !== 'object') return createEmptyWgCoChairsData();
  return {
    items: Array.isArray(value.items)
      ? value.items.map((item) => ({
          profileUrl: item?.profileUrl ?? '',
          name: {
            en: item?.name?.en ?? '',
            km: item?.name?.km ?? ''
          },
          description: {
            en: item?.description?.en ?? '',
            km: item?.description?.km ?? ''
          }
        }))
      : []
  };
};

type WgCoChairsFormProps = {
  language: 'en' | 'km';
  value?: WgCoChairsData;
  onChange?: (value: WgCoChairsData) => void;
};

type CoChairSectionProps = {
  value: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
};

function CoChairSection({
  value,
  title,
  subtitle,
  children
}: CoChairSectionProps) {
  return (
    <AccordionItem value={value} className='overflow-hidden rounded-lg border'>
      <AccordionTrigger className='px-4 py-3 text-base font-medium hover:no-underline'>
        <div className='min-w-0 text-left'>
          <div className='truncate'>{title}</div>
          {subtitle ? (
            <div className='text-muted-foreground mt-1 text-sm font-normal'>
              {subtitle}
            </div>
          ) : null}
        </div>
      </AccordionTrigger>
      <AccordionContent className='px-4 pb-4'>{children}</AccordionContent>
    </AccordionItem>
  );
}

export function WgCoChairsForm({
  language,
  value,
  onChange
}: WgCoChairsFormProps) {
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);
  const [uploadingFromDevice, setUploadingFromDevice] = useState(false);
  const qc = useQueryClient();
  const formData = normalizeWgCoChairsData(value);
  const isKhmer = language === 'km';

  const addItem = () => {
    onChange?.({
      ...formData,
      items: [
        ...formData.items,
        {
          profileUrl: '',
          name: { en: '', km: '' },
          description: { en: '', km: '' }
        }
      ]
    });
  };

  const updateProfileUrl = (index: number, profileUrl: string) => {
    onChange?.({
      ...formData,
      items: formData.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, profileUrl } : item
      )
    });
  };

  const updateField = (
    index: number,
    key: 'name' | 'description',
    text: string
  ) => {
    onChange?.({
      ...formData,
      items: formData.items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [key]: {
                ...item[key],
                [language]: text
              }
            }
          : item
      )
    });
  };

  const removeItem = (index: number) => {
    onChange?.({
      ...formData,
      items: formData.items.filter((_, itemIndex) => itemIndex !== index)
    });
  };

  const handleSelectProfileFromMedia = (file: MediaFile) => {
    if (pickerIndex === null) return;
    const selectedUrl = (file.url ?? '').trim();
    if (!selectedUrl) return;
    updateProfileUrl(pickerIndex, selectedUrl);
  };

  const handleUploadProfileFromDevice = async (
    files: File[],
    folderId?: string | null
  ) => {
    const firstFile = files[0];
    const targetIndex = pickerIndex;
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
        throw new Error('Upload succeeded but no URL was returned');
      }

      updateProfileUrl(targetIndex, uploadedUrl);
      await qc.invalidateQueries({ queryKey: ['media'], exact: false });
      toast.success('Profile uploaded successfully');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to upload profile');
    } finally {
      setUploadingFromDevice(false);
    }
  };

  return (
    <Card>
      <CardHeader className='border-b'>
        <CardTitle className='flex items-center gap-2'>
          <Users className='size-5' />
          Working Group Co-Chairs
        </CardTitle>
        <CardAction>
          <Button type='button' size='sm' onClick={addItem}>
            <Plus className='mr-1 size-4' />
            Add Co-Chair
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className='space-y-4'>
        {formData.items.length > 0 ? (
          <Accordion type='multiple' className='space-y-4'>
            {formData.items.map((item, index) => {
              const localizedName = (
                isKhmer ? item.name.km : item.name.en
              ).trim();
              const fallbackName = (
                isKhmer ? item.name.en : item.name.km
              ).trim();
              const title =
                localizedName || fallbackName || `Co-Chair ${index + 1}`;

              return (
                <CoChairSection
                  key={index}
                  value={`co-chair-${index}`}
                  title={title}
                  subtitle={`Co-Chair ${index + 1}`}
                >
                  <div className='space-y-3'>
                    <div className='flex items-center justify-end'>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='text-destructive hover:bg-destructive/10 hover:text-destructive h-7 w-7'
                        onClick={() => removeItem(index)}
                      >
                        <X className='size-4' />
                      </Button>
                    </div>

                    <div className='space-y-2'>
                      <div className='flex items-center justify-between gap-2'>
                        <Label htmlFor={`wg-co-chair-profile-${index}`}>
                          Profile URL
                        </Label>
                        <div className='flex items-center gap-2'>
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() => setPickerIndex(index)}
                          >
                            Choose from Media
                          </Button>
                          {item.profileUrl ? (
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              onClick={() => updateProfileUrl(index, '')}
                            >
                              Clear
                            </Button>
                          ) : null}
                        </div>
                      </div>
                      <Input
                        id={`wg-co-chair-profile-${index}`}
                        value={item.profileUrl}
                        onChange={(event) =>
                          updateProfileUrl(index, event.target.value)
                        }
                        placeholder='https://example.com/profile'
                      />
                      {item.profileUrl ? (
                        <div className='bg-muted relative aspect-video w-full max-w-sm overflow-hidden rounded-lg border'>
                          <Image
                            src={
                              resolveApiAssetUrl(item.profileUrl) ||
                              '/placeholder.svg'
                            }
                            alt={`Co-chair ${index + 1} profile`}
                            fill
                            unoptimized
                            className='object-cover'
                          />
                        </div>
                      ) : null}
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor={`wg-co-chair-name-${index}`}>
                        {isKhmer ? 'Name (Khmer)' : 'Name (English)'}
                      </Label>
                      <Input
                        id={`wg-co-chair-name-${index}`}
                        value={isKhmer ? item.name.km : item.name.en}
                        onChange={(event) =>
                          updateField(index, 'name', event.target.value)
                        }
                        placeholder={isKhmer ? 'បញ្ចូលឈ្មោះ' : 'Enter name'}
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor={`wg-co-chair-description-${index}`}>
                        {isKhmer
                          ? 'Description (Khmer)'
                          : 'Description (English)'}
                      </Label>
                      <Textarea
                        id={`wg-co-chair-description-${index}`}
                        value={
                          isKhmer ? item.description.km : item.description.en
                        }
                        onChange={(event) =>
                          updateField(index, 'description', event.target.value)
                        }
                        placeholder={
                          isKhmer ? 'បញ្ចូលពិពណ៌នា' : 'Enter short description'
                        }
                        rows={4}
                        className='resize-none'
                      />
                    </div>
                  </div>
                </CoChairSection>
              );
            })}
          </Accordion>
        ) : null}

        {formData.items.length === 0 && (
          <div className='text-muted-foreground flex flex-col items-center justify-center rounded-lg border border-dashed py-8'>
            <Users className='mb-2 size-8' />
            <p>No co-chairs added. Click Add Co-Chair to start.</p>
          </div>
        )}
      </CardContent>

      <FileModal
        isOpen={pickerIndex !== null}
        onClose={() => setPickerIndex(null)}
        onSelect={handleSelectProfileFromMedia}
        onUploadFromDevice={handleUploadProfileFromDevice}
        loading={uploadingFromDevice}
        title='Select profile media'
        description='Choose an image from Media Manager.'
        types={['image']}
        accept='image/*'
        allowUploadFromDevice
      />
    </Card>
  );
}
