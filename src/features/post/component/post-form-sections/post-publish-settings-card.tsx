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
import { CalendarIcon, Save } from 'lucide-react';
import { formatDate } from '@/lib/format';

type PostPublishSettingsCardProps = {
  status: 'draft' | 'published';
  publishDate?: string;
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
  onIsFeaturedChange,
  onCategoryChange,
  onSectionChange,
  onPageChange,
  onCancel,
  onSubmit
}: PostPublishSettingsCardProps) {
  const selectedPublishDate = useMemo(() => {
    if (!publishDate) return undefined;
    const parsed = new Date(`${publishDate}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return undefined;
    return parsed;
  }, [publishDate]);
  const normalizedStatus =
    status?.toLowerCase() === 'published' ? 'published' : 'draft';

  const selectedBlockType =
    typeof selectedSection?.blockType === 'string'
      ? selectedSection.blockType
      : '';

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-sm'>Publish Settings</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div>
          <Label htmlFor='status'>Status</Label>
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
              <SelectItem value='draft'>Draft</SelectItem>
              <SelectItem value='published'>Published</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {normalizedStatus === 'published' ? (
          <div className='space-y-2'>
            <Label htmlFor='publish-date'>Publish Date</Label>
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
                    : 'Pick a publish date'}
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
                Clear date
              </Button>
            ) : null}
          </div>
        ) : null}

        <div className='flex items-center space-x-2'>
          <Checkbox
            id='is-featured'
            checked={isFeatured}
            onCheckedChange={(checked) => onIsFeaturedChange(Boolean(checked))}
          />
          <Label htmlFor='is-featured' className='cursor-pointer'>
            Featured
          </Label>
        </div>

        <div>
          <Label htmlFor='category'>Category</Label>
          <Select
            value={(categoryId ?? '').toString()}
            onValueChange={onCategoryChange}
          >
            <SelectTrigger className='mt-1'>
              <SelectValue placeholder='Select a category' />
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

        <div>
          <Label htmlFor='section'>Section</Label>
          <Select
            value={(sectionId ?? '').toString()}
            onValueChange={onSectionChange}
          >
            <SelectTrigger className='mt-1'>
              <SelectValue placeholder='Attach to a section (optional)' />
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
                Block type: {selectedBlockType || 'Unknown'}
              </p>

              {selectedBlockType === 'hero_banner' && (
                <p className='text-muted-foreground'>
                  Hero banner: your post title/description will surface as hero
                  text. Add strong images in the Media section.
                </p>
              )}

              {selectedBlockType === 'post_list' && (
                <div className='text-muted-foreground space-y-2'>
                  <p>
                    Post list: this post will appear according to the
                    section&apos;s category, sort, and limit settings.
                  </p>
                  <p className='text-[11px]'>
                    Adjust those settings inside the Section editor if needed.
                  </p>
                </div>
              )}

              {selectedBlockType &&
                !['hero_banner', 'post_list'].includes(selectedBlockType) && (
                  <p className='text-muted-foreground'>
                    Custom layout: this section will render using its block
                    template.
                  </p>
                )}
            </div>
          ) : null}
        </div>

        <div>
          <Label htmlFor='page'>Page</Label>
          <Select
            value={(pageId ?? '').toString()}
            onValueChange={onPageChange}
          >
            <SelectTrigger className='mt-1'>
              <SelectValue placeholder='Attach to a page (optional)' />
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

        <div className='flex items-center gap-2'>
          <Button variant='outline' onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>
            <Save className='mr-2 h-4 w-4' />
            {isEditing ? 'Update Post' : 'Create Post'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
