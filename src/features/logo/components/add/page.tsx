'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
import { createLogo } from '@/server/action/logo/logo';

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

export default function AddNewLogo() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<LogoFormValues>({
    defaultValues
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  const revokePreview = () => {
    if (previewUrlRef.current && previewUrlRef.current.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    previewUrlRef.current = null;
  };

  const updatePreview = (file: File | null) => {
    revokePreview();
    if (file) {
      const nextUrl = URL.createObjectURL(file);
      previewUrlRef.current = nextUrl;
      setImagePreview(nextUrl);
    } else {
      setImagePreview(null);
    }
  };

  const clearFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    form.setValue('logo', null, { shouldDirty: true });
    updatePreview(null);
    clearFileInput();
    void form.trigger('logo');
  };

  const handleReset = () => {
    form.reset(defaultValues);
    updatePreview(null);
    clearFileInput();
  };

  const handleCancel = () => {
    router.replace('/admin/logo');
  };

  useEffect(() => {
    return () => {
      revokePreview();
    };
  }, []);

  const submitLogo = async (values: LogoFormValues) => {
    try {
      const payload = new FormData();
      const title = values.title.trim();
      const description = values.description.trim();
      const link = values.link.trim();

      payload.append('title', title);
      if (description) payload.append('description', description);
      if (link) payload.append('link', link);
      if (values.logo) payload.append('logo', values.logo);

      const result = await createLogo(payload);

      if (!result.success) {
        toast.error(result.error ?? 'Failed to create logo');
        return;
      }

      toast.success('Logo created successfully');
      queryClient.invalidateQueries({ queryKey: ['logo'], exact: false });
      router.replace('/admin/logo');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create logo';
      toast.error(message);
    }
  };

  const onSubmit = form.handleSubmit((values) => {
    startTransition(() => {
      void submitLogo(values);
    });
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className='space-y-6'>
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
                    if (!file) {
                      return 'Logo image is required';
                    }
                    if (file.size > MAX_FILE_SIZE) {
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
                                onChange={(event) => {
                                  const file = event.target.files?.[0] ?? null;
                                  field.onChange(file);
                                  updatePreview(file);
                                  if (file) {
                                    form.clearErrors('logo');
                                  } else {
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
                      disabled={isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      type='submit'
                      appearance='default'
                      variant='primary'
                      disabled={isPending}
                    >
                      {isPending ? 'Creating...' : 'Create'}
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
