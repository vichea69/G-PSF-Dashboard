'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import type { FileWithPreview } from '@/hooks/use-file-upload';

import SiteImage from './site-image';
import SiteSeoForm, {
  siteSeoDefaultValues,
  siteSeoFormSchema,
  type SiteSeoFormValues
} from './site-seo';

export default function SiteSetting() {
  const [profileImage, setProfileImage] = useState<FileWithPreview[]>([]);
  const [logoImage, setLogoImage] = useState<FileWithPreview[]>([]);

  const form = useForm<SiteSeoFormValues>({
    resolver: zodResolver(siteSeoFormSchema),
    defaultValues: siteSeoDefaultValues
  });

  const isSubmitting = form.formState.isSubmitting;

  async function handleSubmit(values: SiteSeoFormValues) {
    try {
      const payload = {
        seo: values,
        profileImage,
        logoImage
      };

      console.log('Saving site settings', payload);
      toast.success('Site settings saved.');
    } catch (error) {
      console.error('Failed to save site settings', error);
      toast.error('Unable to save site settings. Please try again.');
    }
  }

  return (
    <div className='container py-6'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>
          <div className='space-y-6'>
            <SiteSeoForm />
            <SiteImage
              onProfileImageChange={setProfileImage}
              onLogoImageChange={setLogoImage}
            />
          </div>

          <div className='flex justify-end'>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
