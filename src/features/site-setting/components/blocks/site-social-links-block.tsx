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
import { useTranslate } from '@/hooks/use-translate';

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
  const { t } = useTranslate();
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
        <CardTitle className='text-base font-semibold'>
          {t('siteSetting.socialLinks.title')}
        </CardTitle>
        <CardDescription>
          {t('siteSetting.socialLinks.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex justify-end'>
          <Button type='button' variant='outline' size='sm' onClick={addRow}>
            <Plus className='mr-2 h-4 w-4' />
            {t('siteSetting.socialLinks.addLink')}
          </Button>
        </div>

        {value.map((item, index) => {
          const activeOption = getIconOption(item.icon);
          const selectedIconValue = activeOption?.value ?? 'website';

          return (
            <div
              key={`social-${index}`}
              className='space-y-3 rounded-md border p-3'
            >
              <div className='grid gap-3 md:grid-cols-[180px_1fr_1fr_auto] md:items-end'>
                <div className='space-y-1'>
                  <Label>{t('siteSetting.socialLinks.icon')}</Label>
                  <Select
                    value={selectedIconValue}
                    onValueChange={(nextValue) =>
                      updateRow(index, 'icon', nextValue)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t(
                          'siteSetting.socialLinks.selectIconFromLibrary'
                        )}
                      />
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
                  <Label>{t('siteSetting.socialLinks.linkTitle')}</Label>
                  <Input
                    value={item.title}
                    onChange={(event) =>
                      updateRow(index, 'title', event.target.value)
                    }
                    placeholder={t('siteSetting.socialLinks.titlePlaceholder')}
                  />
                </div>

                <div className='space-y-1'>
                  <Label>{t('siteSetting.socialLinks.url')}</Label>
                  <Input
                    value={item.url}
                    onChange={(event) =>
                      updateRow(index, 'url', event.target.value)
                    }
                    placeholder={t('siteSetting.socialLinks.urlPlaceholder')}
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
