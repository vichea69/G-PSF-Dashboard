'use client';

import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import type { FileMetadata, FileWithPreview } from '@/hooks/use-file-upload';
import { useSiteSetting, pickFirstSiteSetting } from '../hook/use-site-setting';
import type { SiteSetting } from '../type/site-setting';
import { UpdateSiteSetting } from '@/server/action/admin/site-setting';

import SiteImage from './site-image';
import SiteSeoForm, {
  siteSeoDefaultValues,
  siteSeoFormSchema,
  type SiteSeoFormValues
} from './site-seo';

function mapSiteSettingToFormValues(
  siteSetting?: Partial<SiteSetting>
): SiteSeoFormValues {
  return {
    siteName: siteSetting?.siteName ?? siteSeoDefaultValues.siteName,
    siteDescription:
      siteSetting?.siteDescription ?? siteSeoDefaultValues.siteDescription,
    siteKeywords: siteSetting?.siteKeyword ?? siteSeoDefaultValues.siteKeywords,
    supportPhone: siteSetting?.sitePhone ?? siteSeoDefaultValues.supportPhone,
    siteAuthor: siteSetting?.siteAuthor ?? siteSeoDefaultValues.siteAuthor,
    contactEmail: siteSetting?.siteEmail ?? siteSeoDefaultValues.contactEmail
  };
}

function createLogoFileMetadata(
  siteSetting?: Partial<SiteSetting>
): FileMetadata[] | undefined {
  const logoUrl = siteSetting?.siteLogo;

  if (!logoUrl) {
    return undefined;
  }

  const urlSegments = logoUrl.split('/');
  const fileName = urlSegments[urlSegments.length - 1] || 'site-logo';
  const extension = fileName.split('.').pop()?.toLowerCase() ?? '';

  const mimeType =
    extension === 'svg'
      ? 'image/svg+xml'
      : extension === 'jpg' || extension === 'jpeg'
        ? 'image/jpeg'
        : extension === 'png'
          ? 'image/png'
          : 'image/*';

  return [
    {
      id: `site-logo-${siteSetting?.id ?? 'preview'}`,
      name: fileName,
      size: 0,
      type: mimeType,
      url: logoUrl
    }
  ];
}

export default function SiteSetting() {
  const [logoImage, setLogoImage] = useState<FileWithPreview[]>([]);
  const { data: siteSettingData, isLoading } = useSiteSetting();
  const queryClient = useQueryClient();

  const form = useForm<SiteSeoFormValues>({
    resolver: zodResolver(siteSeoFormSchema),
    defaultValues: siteSeoDefaultValues
  });

  const resolvedValues = useMemo(
    () => mapSiteSettingToFormValues(siteSettingData ?? undefined),
    [siteSettingData]
  );

  const initialLogoFiles = useMemo(
    () => createLogoFileMetadata(siteSettingData ?? undefined),
    [siteSettingData]
  );

  useEffect(() => {
    if (siteSettingData) {
      form.reset(resolvedValues);
    }
  }, [form, resolvedValues, siteSettingData]);

  useEffect(() => {
    if (!initialLogoFiles || initialLogoFiles.length === 0) {
      return;
    }

    setLogoImage((prev) => {
      const currentId = prev[0]?.id;
      const nextId = initialLogoFiles[0]?.id;

      if (currentId === nextId) {
        return prev;
      }

      return initialLogoFiles.map((file) => ({
        file,
        id: file.id,
        preview: file.url
      }));
    });
  }, [initialLogoFiles]);

  const isSubmitting = form.formState.isSubmitting;
  const isDisabled = isSubmitting || isLoading;

  async function handleSubmit(values: SiteSeoFormValues) {
    try {
      const siteSettingId = siteSettingData?.id;

      if (!siteSettingId) {
        toast.error('Site settings are not available yet. Please try again.');
        return;
      }

      const formData = new FormData();
      formData.set('siteName', values.siteName);
      formData.set('siteDescription', values.siteDescription);
      formData.set('siteKeyword', values.siteKeywords);
      formData.set('sitePhone', values.supportPhone);
      formData.set('siteEmail', values.contactEmail);
      formData.set('siteAuthor', values.siteAuthor);

      const logoFile = logoImage.at(0)?.file;
      if (logoFile instanceof File) {
        formData.set('siteLogo', logoFile);
      }

      const result = await UpdateSiteSetting(siteSettingId, formData);

      const message =
        (typeof result === 'object' && result !== null && 'message' in result
          ? (result as { message?: string }).message
          : undefined) ?? 'Site settings saved.';

      const updatedSetting = pickFirstSiteSetting(
        typeof result === 'object' && result !== null && 'data' in result
          ? (result as { data?: unknown }).data
          : result
      );

      if (updatedSetting) {
        queryClient.setQueryData(['site-setting'], updatedSetting);
      } else {
        await queryClient.invalidateQueries({ queryKey: ['site-setting'] });
      }

      toast.success(message);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to save site settings. Please try again.';
      toast.error(message);
    }
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
          <div className='space-y-6'>
            <SiteSeoForm />
            <SiteImage
              onLogoImageChange={setLogoImage}
              initialLogoFiles={initialLogoFiles}
            />
          </div>

          <div className='flex justify-end'>
            <Button type='submit' disabled={isDisabled}>
              {isSubmitting
                ? 'Saving…'
                : isLoading
                  ? 'Loading…'
                  : 'Save changes'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
