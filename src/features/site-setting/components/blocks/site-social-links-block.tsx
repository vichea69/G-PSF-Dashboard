'use client';

import { Plus, Trash2 } from 'lucide-react';
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTelegram,
  IconBrandTiktok,
  IconBrandX,
  IconBrandYoutube,
  IconWorld
} from '@tabler/icons-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  createEmptySocialLink,
  type SiteSocialLink
} from '@/features/site-setting/types/site-setting-types';

type SocialIconOption = {
  value: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
};

type SiteSocialLinksBlockProps = {
  value: SiteSocialLink[];
  onChange: (next: SiteSocialLink[]) => void;
};

const SOCIAL_ICON_OPTIONS: SocialIconOption[] = [
  { value: 'facebook', label: 'Facebook', Icon: IconBrandFacebook },
  { value: 'telegram', label: 'Telegram', Icon: IconBrandTelegram },
  { value: 'youtube', label: 'YouTube', Icon: IconBrandYoutube },
  { value: 'linkedin', label: 'LinkedIn', Icon: IconBrandLinkedin },
  { value: 'instagram', label: 'Instagram', Icon: IconBrandInstagram },
  { value: 'twitter', label: 'Twitter / X', Icon: IconBrandX },
  { value: 'tiktok', label: 'TikTok', Icon: IconBrandTiktok },
  { value: 'website', label: 'Website', Icon: IconWorld }
];

const getIconOption = (value: string) =>
  SOCIAL_ICON_OPTIONS.find((option) => option.value === value);

export function SiteSocialLinksBlock({
  value,
  onChange
}: SiteSocialLinksBlockProps) {
  const updateRow = (
    index: number,
    key: keyof SiteSocialLink,
    nextValue: string
  ) => {
    const nextRows = value.map((item, rowIndex) =>
      rowIndex === index ? { ...item, [key]: nextValue } : item
    );
    onChange(nextRows);
  };

  const addRow = () => {
    onChange([...value, createEmptySocialLink()]);
  };

  const removeRow = (index: number) => {
    const nextRows = value.filter((_, rowIndex) => rowIndex !== index);
    onChange(nextRows.length > 0 ? nextRows : [createEmptySocialLink()]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base font-semibold'>Social Links</CardTitle>
        <CardDescription>
          Add social links shown in footer or contact section.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex justify-end'>
          <Button type='button' variant='outline' size='sm' onClick={addRow}>
            <Plus className='mr-2 h-4 w-4' />
            Add Link
          </Button>
        </div>

        {value.map((item, index) => {
          const activeOption = getIconOption(item.icon);
          const selectedIconValue = activeOption?.value ?? 'website';
          const previewOption =
            activeOption ?? getIconOption('website') ?? SOCIAL_ICON_OPTIONS[0];
          const PreviewIcon = previewOption.Icon;

          return (
            <div
              key={`social-${index}`}
              className='space-y-3 rounded-md border p-3'
            >
              <div className='grid gap-3 md:grid-cols-[180px_1fr_1fr_auto] md:items-end'>
                <div className='space-y-1'>
                  <Label>Icon</Label>
                  <Select
                    value={selectedIconValue}
                    onValueChange={(nextValue) =>
                      updateRow(index, 'icon', nextValue)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select icon from library' />
                    </SelectTrigger>
                    <SelectContent>
                      {SOCIAL_ICON_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <span className='flex items-center gap-2'>
                            <option.Icon className='h-4 w-4' />
                            {option.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-1'>
                  <Label>Title</Label>
                  <Input
                    value={item.title}
                    onChange={(event) =>
                      updateRow(index, 'title', event.target.value)
                    }
                    placeholder='Facebook'
                  />
                </div>

                <div className='space-y-1'>
                  <Label>URL</Label>
                  <Input
                    value={item.url}
                    onChange={(event) =>
                      updateRow(index, 'url', event.target.value)
                    }
                    placeholder='https://example.com'
                  />
                </div>

                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  onClick={() => removeRow(index)}
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
