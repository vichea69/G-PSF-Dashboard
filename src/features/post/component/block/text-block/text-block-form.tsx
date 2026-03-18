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
import { PostContentEditor } from '@/features/post/component/post-content-editor';
import type { PostContent } from '@/server/action/post/types';
import { FileText, Plus, X } from 'lucide-react';

export type TextBlockDescriptionValue = PostContent | string;

export interface TextBlockData {
  items: {
    title: {
      en: string;
      km: string;
    };
    description: {
      en: TextBlockDescriptionValue;
      km: TextBlockDescriptionValue;
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

  const normalizeDescriptionValue = (
    entry: unknown
  ): TextBlockDescriptionValue => {
    if (!entry) return '';

    if (typeof entry === 'string') {
      const trimmed = entry.trim();
      if (!trimmed) return '';

      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (parsed && typeof parsed === 'object') {
            return parsed as PostContent;
          }
        } catch {
          return entry;
        }
      }

      return entry;
    }

    if (typeof entry === 'object') {
      return entry as PostContent;
    }

    return '';
  };

  return {
    items: Array.isArray(candidate.items)
      ? candidate.items.map((item) => ({
          title: {
            en: item?.title?.en ?? '',
            km: item?.title?.km ?? ''
          },
          description: {
            en: normalizeDescriptionValue(item?.description?.en),
            km: normalizeDescriptionValue(item?.description?.km)
          }
        }))
      : []
  };
};

type TextBlockFormProps = {
  language: 'en' | 'km';
  value?: TextBlockData;
  onChange?: (value: TextBlockData) => void;
  cardTitle?: string;
  descriptionInput?: 'textarea' | 'tiptap';
};

export function TextBlockForm({
  language,
  value,
  onChange,
  cardTitle = 'Text Items',
  descriptionInput = 'textarea'
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

  const updateTitle = (index: number, text: string) => {
    onChange?.({
      ...formData,
      items: formData.items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              title: {
                ...item.title,
                [language]: text
              }
            }
          : item
      )
    });
  };

  const updateDescription = (
    index: number,
    value: TextBlockDescriptionValue
  ) => {
    onChange?.({
      ...formData,
      items: formData.items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              description: {
                ...item.description,
                [language]: value
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
    <Card className='gap-4 border-0 bg-transparent py-0 shadow-none'>
      <CardHeader className='px-0 pb-0'>
        <CardTitle className='flex items-center gap-2'>
          <FileText className='size-5' />
          {cardTitle}
        </CardTitle>
        <CardAction>
          <Button type='button' size='sm' onClick={addItem}>
            <Plus className='mr-1 size-4' />
            Add Text
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className='space-y-4 px-0'>
        {formData.items.map((item, index) => (
          <div
            key={index}
            className='bg-muted/15 ring-border/40 space-y-4 rounded-2xl p-5 ring-1'
          >
            <div className='flex items-center justify-between gap-2'>
              <p className='text-foreground text-sm font-semibold'>{`Text ${index + 1}`}</p>
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
                onChange={(event) => updateTitle(index, event.target.value)}
                placeholder={
                  isKhmer ? 'Enter title in Khmer' : 'Enter title in English'
                }
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor={`text-block-description-${index}`}>
                {isKhmer ? 'Description (Khmer)' : 'Description (English)'}
              </Label>
              {descriptionInput === 'tiptap' ? (
                <PostContentEditor
                  id={`text-block-description-${index}`}
                  value={isKhmer ? item.description.km : item.description.en}
                  onChange={(nextValue) => updateDescription(index, nextValue)}
                  placeholder={
                    isKhmer
                      ? 'Enter description in Khmer'
                      : 'Enter description in English'
                  }
                  mode='text'
                  className='border-border/60 bg-background rounded-xl shadow-none'
                />
              ) : (
                <Textarea
                  id={`text-block-description-${index}`}
                  value={
                    typeof (isKhmer
                      ? item.description.km
                      : item.description.en) === 'string'
                      ? ((isKhmer
                          ? item.description.km
                          : item.description.en) as string)
                      : ''
                  }
                  onChange={(event) =>
                    updateDescription(index, event.target.value)
                  }
                  placeholder={
                    isKhmer
                      ? 'Enter description in Khmer'
                      : 'Enter description in English'
                  }
                  rows={4}
                  className='resize-none'
                />
              )}
            </div>
          </div>
        ))}

        {formData.items.length === 0 && (
          <div className='text-muted-foreground bg-muted/10 border-border/60 flex flex-col items-center justify-center rounded-2xl border border-dashed py-10'>
            <FileText className='mb-2 size-8' />
            <p>No text added. Click Add Text to start.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
