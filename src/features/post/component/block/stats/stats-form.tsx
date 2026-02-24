'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Hash, Plus, X } from 'lucide-react';

export interface StatsBlockData {
  items: {
    value: { en: string; km: string };
    label: { en: string; km: string };
  }[];
}

export const createEmptyStatsData = (): StatsBlockData => ({
  items: []
});

const normalizeStatsData = (value?: StatsBlockData): StatsBlockData => {
  if (!value || typeof value !== 'object') return createEmptyStatsData();
  return {
    items: Array.isArray(value.items)
      ? value.items.map((item) => ({
          value: {
            en: item?.value?.en ?? '',
            km: item?.value?.km ?? ''
          },
          label: {
            en: item?.label?.en ?? '',
            km: item?.label?.km ?? ''
          }
        }))
      : []
  };
};

type StatsFormProps = {
  language: 'en' | 'km';
  value?: StatsBlockData;
  onChange?: (value: StatsBlockData) => void;
};

export function StatsForm({ language, value, onChange }: StatsFormProps) {
  const [formData, setFormData] = useState<StatsBlockData>(() =>
    normalizeStatsData(value)
  );
  const lastValue = useRef<string>('');
  const pendingEmit = useRef<StatsBlockData | null>(null);

  useEffect(() => {
    if (!value) return;
    const serialized = JSON.stringify(value);
    if (serialized === lastValue.current) return;
    lastValue.current = serialized;
    setFormData(normalizeStatsData(value));
  }, [value]);

  useEffect(() => {
    if (!pendingEmit.current) return;
    onChange?.(pendingEmit.current);
    pendingEmit.current = null;
  }, [formData, onChange]);

  const updateForm = (updater: (prev: StatsBlockData) => StatsBlockData) => {
    setFormData((prev) => {
      const next = updater(prev);
      pendingEmit.current = next;
      lastValue.current = JSON.stringify(next);
      return next;
    });
  };

  const addItem = () => {
    updateForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { value: { en: '', km: '' }, label: { en: '', km: '' } }
      ]
    }));
  };

  const updateItemValue = (index: number, lang: 'en' | 'km', text: string) => {
    updateForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, value: { ...item.value, [lang]: text } } : item
      )
    }));
  };

  const updateItemLabel = (index: number, lang: 'en' | 'km', text: string) => {
    updateForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, label: { ...item.label, [lang]: text } } : item
      )
    }));
  };

  const removeItem = (index: number) => {
    updateForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const isKhmer = language === 'km';

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader className='border-b'>
          <CardTitle className='flex items-center gap-2'>
            <Hash className='size-5' />
            Stat Items
          </CardTitle>
          <CardAction>
            <Button type='button' size='sm' onClick={addItem}>
              <Plus className='mr-1 size-4' />
              Add Stat
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
                <Label>{`Stat ${index + 1}`}</Label>
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
              <div className='grid gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor={`stat-value-${index}`}>
                    {isKhmer ? 'Value (Khmer)' : 'Value (English)'}
                  </Label>
                  <Input
                    id={`stat-value-${index}`}
                    value={isKhmer ? item.value.km : item.value.en}
                    onChange={(e) =>
                      updateItemValue(index, language, e.target.value)
                    }
                    placeholder={isKhmer ? 'e.g. ៥០០+' : 'e.g. 500+'}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor={`stat-label-${index}`}>
                    {isKhmer ? 'Label (Khmer)' : 'Label (English)'}
                  </Label>
                  <Input
                    id={`stat-label-${index}`}
                    value={isKhmer ? item.label.km : item.label.en}
                    onChange={(e) =>
                      updateItemLabel(index, language, e.target.value)
                    }
                    placeholder={isKhmer ? 'e.g. អ្នកប្រើប្រាស់' : 'e.g. Users'}
                  />
                </div>
              </div>
            </div>
          ))}
          {formData.items.length === 0 && (
            <div className='text-muted-foreground flex flex-col items-center justify-center rounded-lg border border-dashed py-8'>
              <Hash className='mb-2 size-8' />
              <p>No stats added. Click Add Stat to start.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
