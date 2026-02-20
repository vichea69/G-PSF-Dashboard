'use client';

import { Button } from '@/components/ui/button';
import { useSiteSetting } from '../hook/use-site-setting';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { UpdateSiteSetting } from '@/server/action/site-setting/site-setting';
import { toast } from 'sonner';
import { SiteContactBlock } from '@/features/site-setting/components/blocks/site-contact-block';
import { SiteSocialLinksBlock } from '@/features/site-setting/components/blocks/site-social-links-block';
import { SiteBasicInfoBlock } from '@/features/site-setting/components/blocks/site-basic-info-block';
import {
  createEmptySiteSetting,
  type LocaleKey,
  type SiteSettingFormValues
} from '@/features/site-setting/types/site-setting-types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

function trimSiteSettingPayload(values: SiteSettingFormValues) {
  return {
    title: {
      en: values.title.en.trim(),
      km: values.title.km.trim()
    },
    description: {
      en: values.description.en.trim(),
      km: values.description.km.trim()
    },
    logo: values.logo.trim(),
    footerBackground: values.footerBackground.trim(),
    address: {
      en: values.address.en.trim(),
      km: values.address.km.trim()
    },
    contact: {
      en: {
        phones: values.contact.en.phones
          .map((item) => item.trim())
          .filter(Boolean),
        desks: values.contact.en.desks
          .map((desk) => ({
            title: desk.title.trim(),
            emails: desk.emails.map((email) => email.trim()).filter(Boolean)
          }))
          .filter((desk) => desk.title || desk.emails.length > 0)
      }
    },
    openTime: {
      en: values.openTime.en.trim(),
      km: values.openTime.km.trim()
    },
    socialLinks: values.socialLinks
      .map((item) => {
        const title = item.title.trim();
        const url = item.url.trim();
        const icon = item.icon.trim();
        const hasAnyValue =
          title.length > 0 || url.length > 0 || icon.length > 0;

        if (!hasAnyValue) return null;

        return {
          icon: icon || 'website',
          title,
          url
        };
      })
      .filter((item): item is { icon: string; title: string; url: string } =>
        Boolean(item)
      )
  };
}

function toFormData(values: SiteSettingFormValues) {
  const payload = trimSiteSettingPayload(values);
  const formData = new FormData();
  formData.append('title', JSON.stringify(payload.title));
  formData.append('description', JSON.stringify(payload.description));
  formData.append('logo', payload.logo);
  formData.append('footerBackground', payload.footerBackground);
  formData.append('address', JSON.stringify(payload.address));
  formData.append('contact', JSON.stringify(payload.contact));
  formData.append('openTime', JSON.stringify(payload.openTime));
  formData.append('socialLinks', JSON.stringify(payload.socialLinks));
  return formData;
}

export default function SiteSetting() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useSiteSetting();
  const [formData, setFormData] = useState<SiteSettingFormValues>(
    createEmptySiteSetting()
  );
  const [activeLocale, setActiveLocale] = useState<LocaleKey>('en');

  useEffect(() => {
    if (!data) return;
    setFormData(data);
  }, [data]);

  const mutation = useMutation({
    mutationFn: async (values: SiteSettingFormValues) => {
      const payload = toFormData(values);
      return UpdateSiteSetting(payload);
    },
    onSuccess: () => {
      toast.success('Site settings saved');
      queryClient.invalidateQueries({ queryKey: ['site-setting'] });
    },
    onError: (mutationError: unknown) => {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : 'Failed to save site settings';
      toast.error(message);
    }
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className='text-muted-foreground rounded-md border border-dashed p-6 text-sm'>
        Loading site settings...
      </div>
    );
  }

  if (isError) {
    const message =
      error instanceof Error ? error.message : 'Failed to load site settings';
    return (
      <div className='text-destructive rounded-md border border-dashed p-6 text-sm'>
        {message}
      </div>
    );
  }

  return (
    <div>
      <form className='space-y-6' onSubmit={handleSubmit}>
        <Tabs
          value={activeLocale}
          onValueChange={(value) => setActiveLocale(value as LocaleKey)}
          className='w-fit'
        >
          <TabsList>
            <TabsTrigger value='en'>English</TabsTrigger>
            <TabsTrigger value='km'>Khmer</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className='space-y-6'>
          <SiteBasicInfoBlock
            activeLocale={activeLocale}
            title={formData.title}
            description={formData.description}
            address={formData.address}
            openTime={formData.openTime}
            logo={formData.logo}
            footerBackground={formData.footerBackground}
            onLocalizedChange={(field, locale, value) =>
              setFormData((prev) => ({
                ...prev,
                [field]: {
                  ...prev[field],
                  [locale]: value
                }
              }))
            }
            onMediaChange={(field, value) =>
              setFormData((prev) => ({ ...prev, [field]: value }))
            }
          />

          <SiteContactBlock
            value={formData.contact}
            onChange={(next) =>
              setFormData((prev) => ({ ...prev, contact: next }))
            }
          />

          <SiteSocialLinksBlock
            value={formData.socialLinks}
            onChange={(next) =>
              setFormData((prev) => ({ ...prev, socialLinks: next }))
            }
          />
        </div>

        <div className='flex justify-end'>
          <Button type='submit' disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
