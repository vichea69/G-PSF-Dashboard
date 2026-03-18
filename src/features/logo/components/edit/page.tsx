'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ImageIcon, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { FileModal } from '@/components/modal/file-modal';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { MediaFile } from '@/features/media/types/media-type';
import { useTranslate } from '@/hooks/use-translate';
import { resolveApiAssetUrl } from '@/lib/asset-url';
import {
  getLogo,
  updateLogo,
  type LogoPayload
} from '@/server/action/logo/logo';

type LogoFormValues = {
  title: string;
  description: string;
  link: string;
};

const defaultValues: LogoFormValues = {
  title: '',
  description: '',
  link: ''
};

const isValidHttpUrl = (value: string) => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const toTrimmedString = (value: unknown) => {
  if (typeof value === 'string') return value.trim();
  if (value == null) return '';
  return String(value).trim();
};

const extractLogoImageUrl = (logo: any): string | null => {
  if (!logo || typeof logo !== 'object') return null;
  const candidates = [logo.url, logo.logo, logo.imageUrl];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate;
    }
  }
  return null;
};

export default function EditLogo({ logoId }: { logoId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslate();
  const form = useForm<LogoFormValues>({
    defaultValues
  });

  const [selectedLogoUrl, setSelectedLogoUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [logoPickerOpen, setLogoPickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const applyLogoData = useCallback(
    (logoData: any) => {
      const values: LogoFormValues = {
        title: toTrimmedString(logoData?.title),
        description: toTrimmedString(logoData?.description),
        link: toTrimmedString(logoData?.link)
      };

      form.reset(values);
      form.clearErrors();

      const logoUrl = (extractLogoImageUrl(logoData) ?? '').trim();
      setSelectedLogoUrl(logoUrl);
      setImagePreview(resolveApiAssetUrl(logoUrl));
    },
    [form]
  );

  const fetchLogoData = useCallback(async () => {
    // Use server action so response parsing stays in one place.
    return getLogo(logoId);
  }, [logoId]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    fetchLogoData()
      .then((result) => {
        if (cancelled) return;

        if (!result.success) {
          toast.error(result.error || t('logo.validation.loadFailed'));
          router.replace('/admin/logo');
          return;
        }

        applyLogoData(result.data);
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [applyLogoData, fetchLogoData, router, t]);

  const handleSelectLogoFromMedia = (file: MediaFile) => {
    // Media Manager returns absolute URL. Keep it in state and preview it.
    const nextUrl = (file.url ?? file.thumbnail ?? '').trim();
    if (!nextUrl) {
      toast.error(t('logo.validation.selectedMediaInvalid'));
      return;
    }

    setSelectedLogoUrl(nextUrl);
    setImagePreview(resolveApiAssetUrl(nextUrl));
  };

  const handleRemoveLogo = () => {
    setSelectedLogoUrl('');
    setImagePreview(null);
  };

  const handleCancel = useCallback(() => {
    router.replace('/admin/logo');
  }, [router]);

  const submitLogo = async (values: LogoFormValues) => {
    try {
      const title = values.title.trim();
      const description = values.description.trim();
      const link = values.link.trim();
      const logoUrl = selectedLogoUrl.trim();

      if (!logoUrl) {
        toast.error(t('logo.validation.logoRequired'));
        return;
      }

      // Build payload to match backend format:
      // { title, description, url, link }
      const payload: Partial<LogoPayload> = {
        title,
        url: logoUrl,
        ...(description ? { description } : {}),
        ...(link ? { link } : {})
      };

      const result = await updateLogo(logoId, payload);

      if (!result.success) {
        toast.error(result.error ?? t('logo.validation.updateFailed'));
        return;
      }

      toast.success(t('logo.toast.updated'));
      queryClient.invalidateQueries({ queryKey: ['logo'], exact: false });
      router.replace('/admin/logo');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t('logo.validation.updateFailed');
      toast.error(message);
    }
  };

  const onSubmit = form.handleSubmit((values) => {
    if (isLoading) return;

    startTransition(() => {
      void submitLogo(values);
    });
  });

  const isBusy = isPending || isLoading;

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className='space-y-6' aria-busy={isBusy}>
        <div className='space-y-6'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
            <div className='space-y-6 lg:col-span-2'>
              <Card>
                <CardContent className='space-y-4'>
                  <FormField
                    control={form.control}
                    name='title'
                    rules={{
                      required: t('logo.validation.companyNameRequired'),
                      validate: (value) =>
                        (value?.trim().length ?? 0) >= 2 ||
                        t('logo.validation.companyNameMin')
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor='title'>
                          {t('logo.form.companyName')}
                        </FormLabel>
                        <FormControl>
                          <Input
                            id='title'
                            placeholder={t('logo.form.placeholderName')}
                            type='text'
                            autoComplete='organization'
                            disabled={isBusy}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>

                <CardContent className='space-y-4'>
                  <FormField
                    control={form.control}
                    name='description'
                    rules={{
                      maxLength: {
                        value: 500,
                        message: t('logo.validation.descriptionMax')
                      }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor='description'>
                          {t('logo.form.description')}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            id='description'
                            placeholder={t('logo.form.placeholderDescription')}
                            className='mt-1'
                            rows={4}
                            disabled={isBusy}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>

                <CardContent className='space-y-4'>
                  <FormField
                    control={form.control}
                    name='link'
                    rules={{
                      validate: (value) =>
                        isValidHttpUrl((value ?? '').trim()) ||
                        t('logo.validation.validUrl')
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor='link'>
                          {t('logo.form.websiteUrl')}
                        </FormLabel>
                        <FormControl>
                          <Input
                            id='link'
                            placeholder={t('logo.form.placeholderWebsite')}
                            className='mt-1'
                            type='url'
                            disabled={isBusy}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className='flex items-center justify-between gap-2'>
                    <CardTitle className='flex items-center gap-2'>
                      <ImageIcon className='h-5 w-5' />
                      {t('logo.form.logoImage')}
                    </CardTitle>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => setLogoPickerOpen(true)}
                      disabled={isBusy}
                    >
                      {t('logo.form.selectFromMedia')}
                    </Button>
                  </div>
                  <CardDescription>
                    {t('logo.form.selectFromMediaDescription')}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {imagePreview ? (
                    <div className='bg-muted/30 relative overflow-hidden rounded-lg border p-8'>
                      <Button
                        type='button'
                        variant='destructive'
                        size='icon'
                        className='absolute top-4 right-4 h-8 w-8 rounded-full'
                        onClick={handleRemoveLogo}
                        aria-label={t('logo.form.removeSelectedLogo')}
                        disabled={isBusy}
                      >
                        <X className='h-4 w-4' />
                      </Button>
                      <div className='flex items-center justify-center'>
                        <Image
                          src={imagePreview}
                          alt={t('logo.form.logoPreviewAlt')}
                          width={256}
                          height={256}
                          sizes='256px'
                          unoptimized
                          className='max-h-64 rounded-md object-contain'
                        />
                      </div>
                    </div>
                  ) : (
                    <div className='text-muted-foreground rounded-md border border-dashed p-8 text-sm'>
                      {t('logo.form.noLogoSelected')}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='text-sm'>
                    {t('logo.form.actions')}
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex items-center gap-2'>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={handleCancel}
                      disabled={isBusy}
                    >
                      {t('logo.form.cancel')}
                    </Button>
                    <Button
                      type='submit'
                      appearance='default'
                      variant='primary'
                      disabled={isBusy}
                    >
                      {isPending
                        ? t('logo.form.saving')
                        : t('logo.form.saveChanges')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </form>

      <FileModal
        isOpen={logoPickerOpen}
        onClose={() => setLogoPickerOpen(false)}
        onSelect={handleSelectLogoFromMedia}
        allowUploadFromDevice={false}
        title={t('logo.form.selectLogoImage')}
        description={t('logo.form.selectFromMediaDescription')}
        types={['image']}
        accept='image/*'
      />
    </Form>
  );
}
