'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type {
  LocaleKey,
  LocalizedValue
} from '@/features/site-setting/types/site-setting-types';

type SiteLocalizedBlockProps = {
  title: string;
  description?: string;
  showHeader?: boolean;
  value: LocalizedValue;
  activeLocale: LocaleKey;
  onChange: (locale: LocaleKey, nextValue: string) => void;
  multiline?: boolean;
  placeholders?: {
    en?: string;
    km?: string;
  };
};

export function SiteLocalizedBlock({
  title,
  description,
  showHeader = true,
  value,
  activeLocale,
  onChange,
  multiline = false,
  placeholders
}: SiteLocalizedBlockProps) {
  const isEnglish = activeLocale === 'en';
  const fieldLabel = isEnglish ? `${title} (EN)` : `${title} (KM)`;
  const fieldValue = isEnglish ? value.en : value.km;
  const placeholder = isEnglish
    ? (placeholders?.en ?? `Enter ${title} in English`)
    : (placeholders?.km ?? `បញ្ចូល ${title} ជាភាសាខ្មែរ`);

  return (
    <Card>
      {showHeader ? (
        <CardHeader className='space-y-3'>
          <CardTitle className='text-base font-semibold'>{title}</CardTitle>
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
        </CardHeader>
      ) : null}
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <Label>{fieldLabel}</Label>
          {multiline ? (
            <Textarea
              value={fieldValue}
              onChange={(event) => onChange(activeLocale, event.target.value)}
              placeholder={placeholder}
              className='min-h-[96px]'
            />
          ) : (
            <Input
              value={fieldValue}
              onChange={(event) => onChange(activeLocale, event.target.value)}
              placeholder={placeholder}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
