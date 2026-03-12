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
import { FileText, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { FileModal } from '@/components/modal/file-modal';
import type { MediaFile } from '@/features/media/types/media-type';
import { resolveApiAssetUrl } from '@/lib/asset-url';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { handleImageUpload } from '@/lib/tiptap-utils';
import Image from 'next/image';

type LocalizedTextValue = {
  en: string;
  km: string;
};

type AnnualReportItem = {
  documentFile: string;
  documentThumbnail: string;
  year: string;
  name: LocalizedTextValue;
  keyPoints: LocalizedTextValue[];
};

export interface AnnualReportsData {
  items: AnnualReportItem[];
}

const createEmptyKeyPoints = (): LocalizedTextValue[] => [];

const createEmptyAnnualReportItem = (): AnnualReportItem => ({
  documentFile: '',
  documentThumbnail: '',
  year: '',
  name: { en: '', km: '' },
  keyPoints: createEmptyKeyPoints()
});

export const createEmptyAnnualReportsData = (): AnnualReportsData => ({
  items: []
});

const normalizeAnnualReportsData = (
  value?: AnnualReportsData
): AnnualReportsData => {
  if (!value || typeof value !== 'object')
    return createEmptyAnnualReportsData();

  return {
    items: Array.isArray(value.items)
      ? value.items.map((item) => {
          const rawYear = item?.year;
          const year =
            typeof rawYear === 'string'
              ? rawYear
              : typeof rawYear === 'number' && Number.isFinite(rawYear)
                ? String(rawYear)
                : '';

          const normalizedKeyPoints = Array.isArray(item?.keyPoints)
            ? item.keyPoints.map((point) => ({
                en: point?.en ?? '',
                km: point?.km ?? ''
              }))
            : [];

          const legacyDocumentCover = (item as any)?.documentCover;
          const documentFile = String(
            item?.documentFile ?? legacyDocumentCover ?? ''
          ).trim();
          const documentThumbnail = String(
            item?.documentThumbnail ?? (item as any)?.thumbnailUrl ?? ''
          ).trim();

          return {
            documentFile,
            documentThumbnail,
            year,
            name: {
              en: item?.name?.en ?? '',
              km: item?.name?.km ?? ''
            },
            keyPoints: normalizedKeyPoints
          } as AnnualReportItem;
        })
      : []
  };
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

type AnnualReportsFormProps = {
  language: 'en' | 'km';
  value?: AnnualReportsData;
  onChange?: (value: AnnualReportsData) => void;
};

type ReportSectionProps = {
  value: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
};

function ReportSection({
  value,
  title,
  subtitle,
  children
}: ReportSectionProps) {
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

export function AnnualReportsForm({
  language,
  value,
  onChange
}: AnnualReportsFormProps) {
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);
  const [uploadingFromDevice, setUploadingFromDevice] = useState(false);
  const qc = useQueryClient();
  const isKhmer = language === 'km';
  const formData = normalizeAnnualReportsData(value);

  const addItem = () => {
    onChange?.({
      ...formData,
      items: [...formData.items, createEmptyAnnualReportItem()]
    });
  };

  const removeItem = (index: number) => {
    onChange?.({
      ...formData,
      items: formData.items.filter((_, itemIndex) => itemIndex !== index)
    });
  };

  const updateItem = (
    index: number,
    updater: (item: AnnualReportItem) => AnnualReportItem
  ) => {
    onChange?.({
      ...formData,
      items: formData.items.map((item, itemIndex) =>
        itemIndex === index ? updater(item) : item
      )
    });
  };

  const updateDocumentFile = (
    index: number,
    documentFile: string,
    documentThumbnail?: string
  ) => {
    updateItem(index, (item) => ({
      ...item,
      documentFile,
      ...(typeof documentThumbnail === 'string' ? { documentThumbnail } : {})
    }));
  };

  const updateYear = (index: number, rawValue: string) => {
    updateItem(index, (item) => ({
      ...item,
      year: rawValue
    }));
  };

  const updateName = (index: number, text: string) => {
    updateItem(index, (item) => ({
      ...item,
      name: {
        ...item.name,
        [language]: text
      }
    }));
  };

  const updateKeyPoint = (
    index: number,
    keyPointIndex: number,
    text: string
  ) => {
    updateItem(index, (item) => ({
      ...item,
      keyPoints: item.keyPoints.map((point, pointIndex) =>
        pointIndex === keyPointIndex
          ? {
              ...point,
              [language]: text
            }
          : point
      )
    }));
  };

  const addKeyPoint = (index: number) => {
    updateItem(index, (item) => ({
      ...item,
      keyPoints: [...item.keyPoints, { en: '', km: '' }]
    }));
  };

  const removeKeyPoint = (index: number, keyPointIndex: number) => {
    updateItem(index, (item) => ({
      ...item,
      keyPoints: item.keyPoints.filter(
        (_, pointIndex) => pointIndex !== keyPointIndex
      )
    }));
  };

  const handleSelectFileFromMedia = (file: MediaFile) => {
    if (pickerIndex === null) return;
    const selectedUrl = (file.url ?? '').trim();
    if (!selectedUrl) return;
    updateDocumentFile(pickerIndex, selectedUrl, (file.thumbnail ?? '').trim());
  };

  const handleUploadFileFromDevice = async (
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

      updateDocumentFile(
        targetIndex,
        uploadedUrl,
        (result?.metadata?.thumbnail ?? '').trim()
      );
      await qc.invalidateQueries({ queryKey: ['media'], exact: false });
      toast.success('Document file uploaded successfully');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to upload document file');
    } finally {
      setUploadingFromDevice(false);
    }
  };

  return (
    <Card>
      <CardHeader className='border-b'>
        <CardTitle>Annual Reports</CardTitle>
        <CardAction>
          <Button type='button' size='sm' onClick={addItem}>
            <Plus className='mr-1 size-4' />
            Add Report
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className='space-y-4'>
        {formData.items.length > 0 ? (
          <Accordion
            type='single'
            collapsible
            defaultValue='report-0'
            className='space-y-4'
          >
            {formData.items.map((item, index) => {
              const reportTitle =
                (isKhmer ? item.name.km : item.name.en).trim() ||
                item.year.trim() ||
                `Report ${index + 1}`;
              const reportSubtitle = item.year.trim()
                ? `Year ${item.year.trim()}`
                : undefined;

              return (
                <ReportSection
                  key={index}
                  value={`report-${index}`}
                  title={reportTitle}
                  subtitle={reportSubtitle}
                >
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between gap-2'>
                      <Label>{`Report ${index + 1}`}</Label>
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
                        <Label htmlFor={`annual-report-file-${index}`}>
                          Document File
                        </Label>
                        <div className='flex items-center gap-2'>
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() => setPickerIndex(index)}
                          >
                            Select from Media
                          </Button>
                          {item.documentFile ? (
                            <Button
                              type='button'
                              variant='ghost'
                              size='sm'
                              onClick={() => updateDocumentFile(index, '', '')}
                            >
                              Clear
                            </Button>
                          ) : null}
                        </div>
                      </div>
                      {resolveApiAssetUrl(item.documentFile) ? (
                        <div className='space-y-2 rounded-md border p-3'>
                          <p className='flex items-center gap-2 text-sm font-medium'>
                            <FileText className='h-4 w-4' />
                            {getFileNameFromUrl(item.documentFile) ||
                              'Selected file'}
                          </p>
                          {resolveApiAssetUrl(item.documentThumbnail) ? (
                            <div className='relative h-40 w-full max-w-xs overflow-hidden rounded border'>
                              <Image
                                src={
                                  resolveApiAssetUrl(item.documentThumbnail) ||
                                  '/placeholder.svg'
                                }
                                alt={`Annual report thumbnail ${index + 1}`}
                                fill
                                unoptimized
                                className='object-contain'
                              />
                            </div>
                          ) : (
                            <div className='text-muted-foreground bg-muted/40 rounded border p-3 text-sm'>
                              Preview not available
                            </div>
                          )}
                          <Button
                            asChild
                            variant='outline'
                            size='sm'
                            className='w-fit'
                          >
                            <a
                              href={resolveApiAssetUrl(item.documentFile)}
                              target='_blank'
                              rel='noreferrer'
                            >
                              Open document
                            </a>
                          </Button>
                        </div>
                      ) : (
                        <div className='text-muted-foreground rounded-md border border-dashed p-3 text-sm'>
                          No document selected (optional)
                        </div>
                      )}
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor={`annual-report-year-${index}`}>
                        Year
                      </Label>
                      <Input
                        id={`annual-report-year-${index}`}
                        type='text'
                        inputMode='numeric'
                        value={item.year}
                        onChange={(event) =>
                          updateYear(index, event.target.value)
                        }
                        placeholder='2026'
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor={`annual-report-name-${index}`}>
                        {isKhmer ? 'Name (Khmer)' : 'Name (English)'}
                      </Label>
                      <Input
                        id={`annual-report-name-${index}`}
                        value={isKhmer ? item.name.km : item.name.en}
                        onChange={(event) =>
                          updateName(index, event.target.value)
                        }
                        placeholder={
                          isKhmer ? 'បញ្ចូលឈ្មោះរបាយការណ៍' : 'Enter report name'
                        }
                      />
                    </div>

                    <div className='space-y-3'>
                      <div className='flex items-center justify-between gap-2'>
                        <Label>Key Points</Label>
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() => addKeyPoint(index)}
                        >
                          <Plus className='mr-1 size-4' />
                          Add Key Point
                        </Button>
                      </div>

                      {item.keyPoints.map((point, keyPointIndex) => (
                        <div
                          key={keyPointIndex}
                          className='bg-background space-y-2 rounded-md border p-3'
                        >
                          <div className='flex items-center justify-between gap-2'>
                            <Label
                              htmlFor={`annual-report-key-point-${index}-${keyPointIndex}`}
                            >
                              {`Key Point ${keyPointIndex + 1} ${
                                isKhmer ? '(Khmer)' : '(English)'
                              }`}
                            </Label>
                            <Button
                              type='button'
                              variant='ghost'
                              size='icon'
                              className='text-destructive hover:bg-destructive/10 hover:text-destructive h-7 w-7'
                              onClick={() =>
                                removeKeyPoint(index, keyPointIndex)
                              }
                            >
                              <X className='size-4' />
                            </Button>
                          </div>
                          <Input
                            id={`annual-report-key-point-${index}-${keyPointIndex}`}
                            value={isKhmer ? point.km : point.en}
                            onChange={(event) =>
                              updateKeyPoint(
                                index,
                                keyPointIndex,
                                event.target.value
                              )
                            }
                            placeholder={
                              isKhmer
                                ? `បញ្ចូលចំណុចសំខាន់ទី ${keyPointIndex + 1}`
                                : `Enter key point ${keyPointIndex + 1}`
                            }
                          />
                        </div>
                      ))}

                      {item.keyPoints.length === 0 ? (
                        <div className='text-muted-foreground rounded-md border border-dashed p-3 text-sm'>
                          No key points yet. Click Add Key Point.
                        </div>
                      ) : null}
                    </div>
                  </div>
                </ReportSection>
              );
            })}
          </Accordion>
        ) : null}
        {formData.items.length === 0 ? (
          <div className='text-muted-foreground rounded-lg border border-dashed py-8 text-center'>
            No annual report added. Click Add Report to start.
          </div>
        ) : null}
      </CardContent>

      <FileModal
        isOpen={pickerIndex !== null}
        onClose={() => setPickerIndex(null)}
        onSelect={handleSelectFileFromMedia}
        onUploadFromDevice={handleUploadFileFromDevice}
        loading={uploadingFromDevice}
        title='Select document file'
        description='Choose a file from Media Manager.'
        types={['pdf', 'document']}
        accept='*/*'
        allowUploadFromDevice
      />
    </Card>
  );
}
