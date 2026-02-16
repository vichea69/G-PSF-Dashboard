'use client';

import Image from 'next/image';
import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ImageIcon, X } from 'lucide-react';
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
import { FileModal } from '@/components/modal/file-modal';
import type { MediaFile } from '@/features/media/types/media-type';
import { resolveApiAssetUrl } from '@/lib/asset-url';
import { createLogo, type LogoPayload } from '@/server/action/logo/logo';

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

export default function AddNewLogo() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<LogoFormValues>({
    defaultValues
  });

  const [selectedLogoUrl, setSelectedLogoUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [logoPickerOpen, setLogoPickerOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleCancel = () => {
    router.replace('/admin/logo');
  };

  const handleSelectLogoFromMedia = (file: MediaFile) => {
    // Media Manager returns absolute URL. Keep it in state and preview it.
    const selectedUrl = (file.url ?? file.thumbnail ?? '').trim();
    if (!selectedUrl) {
      toast.error('Selected media does not have a valid URL');
      return;
    }

    setSelectedLogoUrl(selectedUrl);
    setImagePreview(resolveApiAssetUrl(selectedUrl));
  };

  const handleRemoveLogo = () => {
    setSelectedLogoUrl('');
    setImagePreview(null);
  };

  const submitLogo = async (values: LogoFormValues) => {
    try {
      const title = values.title.trim();
      const description = values.description.trim();
      const link = values.link.trim();
      const logoUrl = selectedLogoUrl.trim();

      if (!logoUrl) {
        toast.error('Logo image is required');
        return;
      }

      // Build payload to match backend format:
      // { title, description, url, link }
      const payload: LogoPayload = {
        title,
        url: logoUrl,
        ...(description ? { description } : {}),
        ...(link ? { link } : {})
      };

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

              <Card>
                <CardHeader>
                  <div className='flex items-center justify-between gap-2'>
                    <CardTitle className='flex items-center gap-2'>
                      <ImageIcon className='h-5 w-5' />
                      Logo Image
                    </CardTitle>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => setLogoPickerOpen(true)}
                      disabled={isPending}
                    >
                      Select from Media
                    </Button>
                  </div>
                  <CardDescription>
                    Select an image from Media Manager.
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
                        aria-label='Remove selected logo'
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
                  ) : (
                    <div className='text-muted-foreground rounded-md border border-dashed p-8 text-sm'>
                      No logo selected.
                    </div>
                  )}
                </CardContent>
              </Card>
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

      <FileModal
        isOpen={logoPickerOpen}
        onClose={() => setLogoPickerOpen(false)}
        onSelect={handleSelectLogoFromMedia}
        allowUploadFromDevice={false}
        title='Select logo image'
        description='Select an image from Media Manager.'
        types={['image']}
        accept='image/*'
      />
    </Form>
  );
}
