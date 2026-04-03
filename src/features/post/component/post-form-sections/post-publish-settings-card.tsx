'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useTranslate } from '@/hooks/use-translate';
import { CalendarIcon, Save } from 'lucide-react';
import { formatDate } from '@/lib/format';

type PostPublishSettingsCardProps = {
  status: 'draft' | 'published';
  publishDate?: string;
  expiredDate?: string;
  isFeatured: boolean;
  categoryId?: number | string;
  sectionId?: number | string;
  pageId?: number | string;
  categories: Array<Record<string, unknown>>;
  sections: Array<Record<string, unknown>>;
  pages: Array<Record<string, unknown>>;
  selectedSection?: Record<string, unknown>;
  isEditing: boolean;
  onStatusChange: (value: 'draft' | 'published') => void;
  onPublishDateChange: (value: string) => void;
  onExpiredDateChange: (value: string) => void;
  onIsFeaturedChange: (value: boolean) => void;
  onCategoryChange: (value: string) => void;
  onSectionChange: (value: string) => void;
  onPageChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
};

const toDateOnly = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const CALENDAR_FROM_YEAR = 2000;

const parseDateOnly = (value?: string) => {
  if (!value) return undefined;
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed;
};

const buildYearOptions = (fromYear: number, toYear: number) => {
  return Array.from(
    { length: Math.max(toYear - fromYear + 1, 1) },
    (_, index) => fromYear + index
  );
};

type PublishDateFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  clearLabel: string;
  yearLabel: string;
  value?: string;
  onChange: (value: string) => void;
};

function PublishDateField({
  id,
  label,
  placeholder,
  clearLabel,
  yearLabel,
  value,
  onChange
}: PublishDateFieldProps) {
  const selectedDate = useMemo(() => parseDateOnly(value), [value]);
  const currentYear = new Date().getFullYear();
  const maxYear = Math.max(
    currentYear,
    selectedDate?.getFullYear() ?? currentYear
  );
  const yearOptions = useMemo(
    () => buildYearOptions(CALENDAR_FROM_YEAR, maxYear),
    [maxYear]
  );
  const [displayMonth, setDisplayMonth] = useState<Date>(
    () => selectedDate ?? new Date()
  );

  useEffect(() => {
    setDisplayMonth(selectedDate ?? new Date());
  }, [selectedDate]);

  const handleYearChange = (nextYear: string) => {
    const parsedYear = Number(nextYear);
    if (!Number.isFinite(parsedYear)) return;

    setDisplayMonth((previousMonth) => {
      return new Date(parsedYear, previousMonth.getMonth(), 1);
    });
  };

  return (
    <div className='space-y-2'>
      <Label htmlFor={id}>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type='button'
            variant='outline'
            className='w-full justify-start text-left font-normal'
          >
            <CalendarIcon className='mr-2 h-4 w-4' />
            {selectedDate ? formatDate(selectedDate) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <div className='border-b p-3 pb-2'>
            <div className='space-y-1'>
              <Label className='text-muted-foreground text-xs'>
                {yearLabel}
              </Label>
              <Select
                value={String(displayMonth.getFullYear())}
                onValueChange={handleYearChange}
              >
                <SelectTrigger className='h-8 w-full min-w-32'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='max-h-64'>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Calendar
            mode='single'
            month={displayMonth}
            onMonthChange={setDisplayMonth}
            selected={selectedDate}
            onSelect={(date) => onChange(date ? toDateOnly(date) : '')}
            fromYear={CALENDAR_FROM_YEAR}
            toYear={maxYear}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {value ? (
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='h-7 px-2 text-xs'
          onClick={() => onChange('')}
        >
          {clearLabel}
        </Button>
      ) : null}
    </div>
  );
}

export function PostPublishSettingsCard({
  status,
  publishDate,
  expiredDate,
  isFeatured,
  categoryId,
  sectionId,
  pageId,
  categories,
  sections,
  pages,
  selectedSection,
  isEditing,
  onStatusChange,
  onPublishDateChange,
  onExpiredDateChange,
  onIsFeaturedChange,
  onCategoryChange,
  onSectionChange,
  onPageChange,
  onCancel,
  onSubmit
}: PostPublishSettingsCardProps) {
  const { t } = useTranslate();
  const normalizedStatus =
    status?.toLowerCase() === 'published' ? 'published' : 'draft';

  const selectedBlockType =
    typeof selectedSection?.blockType === 'string'
      ? selectedSection.blockType
      : '';

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-sm'>
          {t('post.publishSettings.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <Label htmlFor='status'>{t('post.publishSettings.status')}</Label>
          <Select
            value={normalizedStatus}
            onValueChange={(value) =>
              onStatusChange(value === 'published' ? 'published' : 'draft')
            }
          >
            <SelectTrigger className='mt-1'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='draft'>
                {t('post.publishSettings.draft')}
              </SelectItem>
              <SelectItem value='published'>
                {t('post.publishSettings.published')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {normalizedStatus === 'published' ? (
          <PublishDateField
            id='publish-date'
            label={t('post.publishSettings.publishDate')}
            placeholder={t('post.publishSettings.pickPublishDate')}
            clearLabel={t('post.publishSettings.clearDate')}
            yearLabel={t('post.publishSettings.year')}
            value={publishDate}
            onChange={onPublishDateChange}
          />
        ) : null}

        {selectedBlockType === 'announcement' && (
          <PublishDateField
            id='expired-date'
            label={t('post.publishSettings.expiredDate')}
            placeholder={t('post.publishSettings.pickExpiryDate')}
            clearLabel={t('post.publishSettings.clearDate')}
            yearLabel={t('post.publishSettings.year')}
            value={expiredDate}
            onChange={onExpiredDateChange}
          />
        )}

        <div className='flex items-center space-x-2'>
          <Checkbox
            id='is-featured'
            checked={isFeatured}
            onCheckedChange={(checked) => onIsFeaturedChange(Boolean(checked))}
          />
          <Label htmlFor='is-featured' className='cursor-pointer'>
            {t('post.publishSettings.featured')}
          </Label>
        </div>

        <div>
          <div className='flex items-center justify-between gap-2'>
            <Label htmlFor='page'>{t('post.publishSettings.page')}</Label>
            {pageId ? (
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='h-7 px-2 text-xs'
                onClick={() => onPageChange('')}
              >
                {t('post.publishSettings.clearSelection')}
              </Button>
            ) : null}
          </div>
          <Select
            value={(pageId ?? '').toString()}
            onValueChange={onPageChange}
          >
            <SelectTrigger className='mt-1'>
              <SelectValue
                placeholder={t('post.publishSettings.pagePlaceholder')}
              />
            </SelectTrigger>
            <SelectContent>
              {pages.map((page) => (
                <SelectItem key={String(page.id)} value={String(page.id)}>
                  {String(page.title ?? page.slug ?? page.id)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className='flex items-center justify-between gap-2'>
            <Label htmlFor='section'>{t('post.publishSettings.section')}</Label>
            {sectionId ? (
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='h-7 px-2 text-xs'
                onClick={() => onSectionChange('')}
              >
                {t('post.publishSettings.clearSelection')}
              </Button>
            ) : null}
          </div>
          <Select
            value={(sectionId ?? '').toString()}
            onValueChange={onSectionChange}
          >
            <SelectTrigger className='mt-1'>
              <SelectValue
                placeholder={t('post.publishSettings.sectionPlaceholder')}
              />
            </SelectTrigger>
            <SelectContent>
              {sections.map((section) => (
                <SelectItem key={String(section.id)} value={String(section.id)}>
                  {String(section.title ?? section.blockType ?? section.id)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedSection ? (
            <div className='border-muted bg-muted/30 mt-3 space-y-1 rounded-md border p-3 text-xs'>
              <p className='font-medium'>
                {t('post.publishSettings.blockType')}:{' '}
                {selectedBlockType || t('post.publishSettings.unknown')}
              </p>

              {selectedBlockType === 'hero_banner' && (
                <p className='text-muted-foreground'>
                  {t('post.publishSettings.heroBannerHelp')}
                </p>
              )}

              {selectedBlockType === 'stats' && (
                <p className='text-muted-foreground'>
                  {t('post.publishSettings.statsHelp')}
                </p>
              )}

              {selectedBlockType === 'post_list' && (
                <div className='text-muted-foreground space-y-2'>
                  <p>{t('post.publishSettings.postListHelp')}</p>
                  <p className='text-[11px]'>
                    {t('post.publishSettings.postListHelpSecondary')}
                  </p>
                </div>
              )}

              {selectedBlockType &&
                !['hero_banner', 'post_list', 'stats'].includes(
                  selectedBlockType
                ) && (
                  <p className='text-muted-foreground'>
                    {t('post.publishSettings.customLayoutHelp')}
                  </p>
                )}
            </div>
          ) : null}
        </div>

        <div>
          <div className='flex items-center justify-between gap-2'>
            <Label htmlFor='category'>
              {t('post.publishSettings.category')}
            </Label>
            {categoryId ? (
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='h-7 px-2 text-xs'
                onClick={() => onCategoryChange('')}
              >
                {t('post.publishSettings.clearSelection')}
              </Button>
            ) : null}
          </div>
          <Select
            value={(categoryId ?? '').toString()}
            onValueChange={onCategoryChange}
          >
            <SelectTrigger className='mt-1'>
              <SelectValue
                placeholder={t('post.publishSettings.categoryPlaceholder')}
              />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem
                  key={String(category.id)}
                  value={String(category.id)}
                >
                  {String(
                    category.name ??
                      category.title ??
                      category.slug ??
                      category.id
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center gap-2'>
          <Button variant='outline' onClick={onCancel}>
            {t('post.publishSettings.back')}
          </Button>
          <Button onClick={onSubmit}>
            <Save className='mr-2 h-4 w-4' />
            {isEditing
              ? t('post.publishSettings.updatePost')
              : t('post.publishSettings.createPost')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
