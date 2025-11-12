'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
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
import { api } from '@/lib/api';
import { updateLogo } from '@/server/action/logo/logo';

type LogoFormValues = {
  title: string;
  description: string;
  link: string;
  logo: File | null;
};

const defaultValues: LogoFormValues = {
  title: '',
  description: '',
  link: '',
  logo: null
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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

type FetchLogoResult =
  | { success: true; data: any }
  | { success: false; error: string };

export default function EditLogo({ logoId }: { logoId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<LogoFormValues>({
    defaultValues
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [hasPersistedImage, setHasPersistedImage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  const revokePreview = useCallback(() => {
    if (previewUrlRef.current && previewUrlRef.current.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    previewUrlRef.current = null;
  }, []);

  const updatePreview = useCallback(
    (file: File | null) => {
      revokePreview();
      if (file) {
        const nextUrl = URL.createObjectURL(file);
        previewUrlRef.current = nextUrl;
        setImagePreview(nextUrl);
      } else {
        setImagePreview(null);
      }
    },
    [revokePreview]
  );

  const clearFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const applyLogoData = useCallback(
    (logoData: any) => {
      const values: LogoFormValues = {
        title: toTrimmedString(logoData?.title),
        description: toTrimmedString(logoData?.description),
        link: toTrimmedString(logoData?.link),
        logo: null
      };

      form.reset(values);
      form.clearErrors();

      const remoteUrl = extractLogoImageUrl(logoData);
      setHasPersistedImage(Boolean(remoteUrl));

      revokePreview();
      setImagePreview(remoteUrl);
      clearFileInput();
    },
    [clearFileInput, form, revokePreview]
  );

  const fetchLogoData = useCallback(async (): Promise<FetchLogoResult> => {
    const trimmedId = String(logoId ?? '').trim();
    if (!trimmedId) {
      return { success: false, error: 'Logo id is required' };
    }

    const url = `/logo/${encodeURIComponent(trimmedId)}`;

    try {
      const res = await api.get(url);
      const raw = res.data;
      const data = raw?.data?.logo ?? raw?.data ?? raw?.logo ?? raw ?? null;

      if (!data) {
        return { success: false, error: 'Logo not found' };
      }

      return { success: true, data };
    } catch (error: unknown) {
      const message = isAxiosError(error)
        ? ((error.response?.data as any)?.message ??
          (error.response?.data as any)?.error ??
          error.message)
        : error instanceof Error
          ? error.message
          : 'Failed to load logo';
      return { success: false, error: message };
    }
  }, [logoId]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    fetchLogoData()
      .then((result) => {
        if (cancelled) return;

        if (!result.success) {
          toast.error(result.error);
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
  }, [applyLogoData, fetchLogoData, router]);

  useEffect(() => {
    return () => {
      revokePreview();
    };
  }, [revokePreview]);

  const handleRemoveImage = () => {
    form.setValue('logo', null, { shouldDirty: true });
    updatePreview(null);
    clearFileInput();
    setHasPersistedImage(false);
    void form.trigger('logo');
  };

  const handleCancel = useCallback(() => {
    router.replace('/admin/logo');
  }, [router]);

  const submitLogo = async (values: LogoFormValues) => {
    try {
      const payload = new FormData();
      const title = values.title.trim();
      const description = values.description.trim();
      const link = values.link.trim();

      payload.append('title', title);
      payload.append('description', description);
      payload.append('link', link);
      if (values.logo) payload.append('logo', values.logo);

      const result = await updateLogo(logoId, payload);

      if (!result.success) {
        toast.error(result.error ?? 'Failed to update logo');
        return;
      }

      toast.success('Logo updated successfully');
      queryClient.invalidateQueries({ queryKey: ['logo'], exact: false });
      router.replace('/admin/logo');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update logo';
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
                      required: 'Company name is required',
                      validate: (value) =>
                        (value?.trim().length ?? 0) >= 2 ||
                        'Company name must be at least 2 characters'
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor='title'>Company Name</FormLabel>
                        <FormControl>
                          <Input
                            id='title'
                            placeholder='name'
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
                        message: 'Description must be 500 characters or less'
                      }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor='description'>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            id='description'
                            placeholder='description'
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
                        'Enter a valid URL (include http/https)'
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor='link'>Website URL</FormLabel>
                        <FormControl>
                          <Input
                            id='link'
                            placeholder='https://example.com'
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

              <FormField
                control={form.control}
                name='logo'
                rules={{
                  validate: (file) => {
                    if (!file && !hasPersistedImage) {
                      return 'Logo image is required';
                    }
                    if (file && file.size > MAX_FILE_SIZE) {
                      return 'Logo must be 5MB or less';
                    }
                    return true;
                  }
                }}
                render={({ field }) => (
                  <FormItem className='space-y-2'>
                    <Card>
                      <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                          <Upload className='h-5 w-5' />
                          Logo Upload
                        </CardTitle>
                        <CardDescription>
                          Upload your company logo image (PNG, JPG, SVG)
                        </CardDescription>
                      </CardHeader>

                      <CardContent>
                        <div className='space-y-4'>
                          {!imagePreview ? (
                            <label
                              htmlFor='logo-upload'
                              className='group border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-accent/50 relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors'
                            >
                              <div className='flex flex-col items-center gap-2 text-center'>
                                <div className='bg-primary/10 group-hover:bg-primary/20 rounded-full p-4'>
                                  <Upload className='text-muted-foreground h-8 w-8' />
                                </div>
                                <div className='space-y-1'>
                                  <p className='text-sm font-medium'>
                                    Click to upload or drag and drop
                                  </p>
                                  <p className='text-muted-foreground text-xs'>
                                    SVG, PNG, JPG or GIF (max. 5MB)
                                  </p>
                                </div>
                              </div>
                              <input
                                ref={(element) => {
                                  fileInputRef.current = element;
                                  field.ref(element);
                                }}
                                id='logo-upload'
                                type='file'
                                className='hidden'
                                accept='image/*'
                                disabled={isBusy}
                                onChange={(event) => {
                                  const file = event.target.files?.[0] ?? null;
                                  field.onChange(file);
                                  updatePreview(file);
                                  if (file) {
                                    setHasPersistedImage(false);
                                    form.clearErrors('logo');
                                  } else if (!hasPersistedImage) {
                                    void form.trigger('logo');
                                  }
                                }}
                              />
                            </label>
                          ) : (
                            <div className='space-y-4'>
                              <div className='bg-muted/30 relative overflow-hidden rounded-lg border p-8'>
                                <Button
                                  type='button'
                                  variant='destructive'
                                  size='icon'
                                  className='absolute top-4 right-4 h-8 w-8 rounded-full'
                                  onClick={handleRemoveImage}
                                  aria-label='Remove uploaded logo'
                                  disabled={isBusy}
                                >
                                  <X className='h-4 w-4' />
                                </Button>
                                <div className='flex items-center justify-center'>
                                  <Image
                                    src={imagePreview}
                                    alt='Logo preview'
                                    width={256}
                                    height={256}
                                    sizes='256px'
                                    unoptimized
                                    className='max-h-64 rounded-md object-contain'
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='text-sm'>Actions</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex items-center gap-2'>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={handleCancel}
                      disabled={isBusy}
                    >
                      Cancel
                    </Button>
                    <Button
                      type='submit'
                      appearance='default'
                      variant='primary'
                      disabled={isBusy}
                    >
                      {isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
