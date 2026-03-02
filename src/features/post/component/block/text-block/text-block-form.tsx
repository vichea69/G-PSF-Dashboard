'use client';

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
import { FileText, Plus, X } from 'lucide-react';

export interface TextBlockData {
  items: {
    title: {
      en: string;
      km: string;
    };
    description: {
      en: string;
      km: string;
    };
  }[];
}

export const createEmptyTextBlockData = (): TextBlockData => ({
  items: []
});

const normalizeTextBlockData = (value?: TextBlockData): TextBlockData => {
  if (!value || typeof value !== 'object') return createEmptyTextBlockData();

  const candidate = value as TextBlockData & {
    title?: { en?: string; km?: string };
    description?: { en?: string; km?: string };
  };

  // Backward compatibility: convert old single title/description structure.
  if (
    !Array.isArray(candidate.items) &&
    (candidate.title || candidate.description)
  ) {
    return {
      items: [
        {
          title: {
            en: candidate.title?.en ?? '',
            km: candidate.title?.km ?? ''
          },
          description: {
            en: candidate.description?.en ?? '',
            km: candidate.description?.km ?? ''
          }
        }
      ]
    };
  }

  return {
    items: Array.isArray(candidate.items)
      ? candidate.items.map((item) => ({
          title: {
            en: item?.title?.en ?? '',
            km: item?.title?.km ?? ''
          },
          description: {
            en: item?.description?.en ?? '',
            km: item?.description?.km ?? ''
          }
        }))
      : []
  };
};

type TextBlockFormProps = {
  language: 'en' | 'km';
  value?: TextBlockData;
  onChange?: (value: TextBlockData) => void;
};

export function TextBlockForm({
  language,
  value,
  onChange
}: TextBlockFormProps) {
  const formData = normalizeTextBlockData(value);
  const isKhmer = language === 'km';

  const addItem = () => {
    onChange?.({
      ...formData,
      items: [
        ...formData.items,
        {
          title: { en: '', km: '' },
          description: { en: '', km: '' }
        }
      ]
    });
  };

  const updateField = (
    index: number,
    key: 'title' | 'description',
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

  return (
    <Card>
      <CardHeader className='border-b'>
        <CardTitle className='flex items-center gap-2'>
          <FileText className='size-5' />
          Text Items
        </CardTitle>
        <CardAction>
          <Button type='button' size='sm' onClick={addItem}>
            <Plus className='mr-1 size-4' />
            Add Text
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className='space-y-4'>
        {formData.items.map((item, index) => (
          <div
            key={index}
            className='bg-muted/20 space-y-3 rounded-lg border p-4'
          >
            <div className='flex items-center justify-between gap-2'>
              <Label>{`Text ${index + 1}`}</Label>
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
              <Label htmlFor={`text-block-title-${index}`}>
                {isKhmer ? 'Title (Khmer)' : 'Title (English)'}
              </Label>
              <Input
                id={`text-block-title-${index}`}
                value={isKhmer ? item.title.km : item.title.en}
                onChange={(event) =>
                  updateField(index, 'title', event.target.value)
                }
                placeholder={
                  isKhmer ? 'Enter title in Khmer' : 'Enter title in English'
                }
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor={`text-block-description-${index}`}>
                {isKhmer ? 'Description (Khmer)' : 'Description (English)'}
              </Label>
              <Textarea
                id={`text-block-description-${index}`}
                value={isKhmer ? item.description.km : item.description.en}
                onChange={(event) =>
                  updateField(index, 'description', event.target.value)
                }
                placeholder={
                  isKhmer
                    ? 'Enter description in Khmer'
                    : 'Enter description in English'
                }
                rows={4}
                className='resize-none'
              />
            </div>
          </div>
        ))}

        {formData.items.length === 0 && (
          <div className='text-muted-foreground flex flex-col items-center justify-center rounded-lg border border-dashed py-8'>
            <FileText className='mb-2 size-8' />
            <p>No text added. Click Add Text to start.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
