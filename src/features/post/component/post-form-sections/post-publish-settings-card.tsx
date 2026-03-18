'use client';

import { useMemo } from 'react';
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
  const selectedPublishDate = useMemo(() => {
    if (!publishDate) return undefined;
    const parsed = new Date(`${publishDate}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return undefined;
    return parsed;
  }, [publishDate]);

  const selectedExpiredDate = useMemo(() => {
    if (!expiredDate) return undefined;
    const parsed = new Date(`${expiredDate}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return undefined;
    return parsed;
  }, [expiredDate]);
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
          <div className='space-y-2'>
            <Label htmlFor='publish-date'>
              {t('post.publishSettings.publishDate')}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id='publish-date'
                  type='button'
                  variant='outline'
                  className='w-full justify-start text-left font-normal'
                >
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {selectedPublishDate
                    ? formatDate(selectedPublishDate)
                    : t('post.publishSettings.pickPublishDate')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='start'>
                <Calendar
                  mode='single'
                  selected={selectedPublishDate}
                  onSelect={(date) =>
                    onPublishDateChange(date ? toDateOnly(date) : '')
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {publishDate ? (
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='h-7 px-2 text-xs'
                onClick={() => onPublishDateChange('')}
              >
                {t('post.publishSettings.clearDate')}
              </Button>
            ) : null}
          </div>
        ) : null}

        {selectedBlockType === 'announcement' && (
          <div className='space-y-2'>
            <Label htmlFor='expired-date'>
              {t('post.publishSettings.expiredDate')}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id='expired-date'
                  type='button'
                  variant='outline'
                  className='w-full justify-start text-left font-normal'
                >
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {selectedExpiredDate
                    ? formatDate(selectedExpiredDate)
                    : t('post.publishSettings.pickExpiryDate')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='start'>
                <Calendar
                  mode='single'
                  selected={selectedExpiredDate}
                  onSelect={(date) =>
                    onExpiredDateChange(date ? toDateOnly(date) : '')
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {expiredDate ? (
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='h-7 px-2 text-xs'
                onClick={() => onExpiredDateChange('')}
              >
                {t('post.publishSettings.clearDate')}
              </Button>
            ) : null}
          </div>
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
          <Label htmlFor='page'>{t('post.publishSettings.page')}</Label>
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
          <Label htmlFor='section'>{t('post.publishSettings.section')}</Label>
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
          <Label htmlFor='category'>{t('post.publishSettings.category')}</Label>
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
