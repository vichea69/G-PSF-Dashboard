'use client';

import { useFormContext } from 'react-hook-form';
import { z } from 'zod';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

export const siteSeoFormSchema = z.object({
  siteName: z.string().min(1, { message: 'Site name is required.' }),
  siteDescription: z.string().min(1, {
    message: 'Description helps search engines understand your site.'
  }),
  siteKeywords: z.string().min(1, { message: 'Add at least one keyword.' }),
  supportPhone: z.string().min(1, { message: 'Phone number is required.' }),
  siteAuthor: z.string().min(1, { message: 'Author is required.' }),
  contactEmail: z.string().email({ message: 'Enter a valid email address.' })
});

export type SiteSeoFormValues = z.infer<typeof siteSeoFormSchema>;

export const siteSeoDefaultValues: SiteSeoFormValues = {
  siteName: 'G-PSF',
  siteDescription: 'About G-PSF',
  siteKeywords: 'programming, tech, blog',
  supportPhone: '060 896 949',
  siteAuthor: 'Srin Vichea',
  contactEmail: 'smart.vichea@gmail.com'
};

export default function SiteSeoForm() {
  const form = useFormContext<SiteSeoFormValues>();

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base font-semibold'>Site SEO</CardTitle>
        <CardDescription>
          Configure the metadata that helps search engines and social platforms
          understand your brand.
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className='space-y-6'>
        <FormField
          control={form.control}
          name='siteName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='siteDescription'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site Description</FormLabel>
              <FormControl>
                <Textarea className='resize-none' {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='siteKeywords'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Keywords</FormLabel>
              <FormControl>
                <Textarea className='resize-none' {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid gap-6 md:grid-cols-2'>
          <FormField
            control={form.control}
            name='supportPhone'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Site Phone</FormLabel>
                <FormControl>
                  <PhoneInput {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='siteAuthor'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Site author</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='contactEmail'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contact email</FormLabel>
              <FormControl>
                <Input type='email' {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
