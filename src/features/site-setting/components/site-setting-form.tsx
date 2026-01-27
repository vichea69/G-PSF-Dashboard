'use client';

import { Image as ImageIcon, Upload as UploadIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

interface SiteSeoFormProps {
  data?: any;
}

interface SiteImageProps {
  data?: any;
}

export function SiteSeoForm({ data }: SiteSeoFormProps) {
  //Define state for each field
  const [siteName, setSiteName] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [siteKeyword, setSiteKeyword] = useState('');
  const [sitePhone, setSitePhone] = useState('');
  const [siteAuthor, setSiteAuthor] = useState('');
  const [siteEmail, setSiteEmail] = useState('');
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
        <div className='space-y-2'>
          <Label htmlFor='siteName'>Site Name</Label>
          <Input
            id='siteName'
            placeholder=''
            value={data?.siteName ?? ''}
            onChange={(e) => setSiteName(e.target.value)}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='siteDescription'>Site Description</Label>
          <Textarea
            id='siteDescription'
            className='resize-none'
            placeholder=''
            value={data?.siteDescription ?? ''}
            readOnly
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='siteKeyword'>Keywords</Label>
          <Textarea
            id='siteKeyword'
            className='resize-none'
            placeholder=''
            value={data?.siteKeyword ?? ''}
            readOnly
          />
        </div>

        <div className='grid gap-6 md:grid-cols-2'>
          <div className='space-y-2'>
            <Label htmlFor='sitePhone'>Site Phone</Label>
            <PhoneInput
              id='sitePhone'
              placeholder=''
              value={data?.sitePhone ?? ''}
              readOnly
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='siteAuthor'>Site Author</Label>
            <Input
              id='siteAuthor'
              placeholder=''
              value={data?.siteAuthor ?? ''}
              readOnly
            />
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='siteEmail'>Contact email</Label>
          <Input
            id='siteEmail'
            type='email'
            placeholder=''
            value={data?.siteEmail ?? ''}
            readOnly
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function SiteImage({}: SiteImageProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base font-semibold'>Site Images</CardTitle>
        <CardDescription>
          The logo and brand imagery that appear across your site.
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className='space-y-6'>
        <div className='space-y-2'>
          <div>
            <p className='text-foreground text-sm font-medium'>Site Logo</p>
            <p className='text-muted-foreground text-sm'>
              Recommended at least 512 × 512px with transparent background.
            </p>
          </div>

          <div className='bg-background hover:border-muted-foreground/50 relative flex min-h-[180px] flex-col justify-center rounded-lg border border-dashed transition-colors'>
            <div className='flex flex-1 flex-col items-center justify-center gap-3 px-6 py-8 text-center'>
              <span className='bg-muted flex h-14 w-14 items-center justify-center rounded-full'>
                <ImageIcon className='text-muted-foreground h-6 w-6' />
              </span>

              <div className='text-muted-foreground space-y-1 text-sm'>
                <p className='text-foreground font-medium'>
                  Drag & drop your file or{' '}
                  <span className='text-primary underline underline-offset-2'>
                    Browse
                  </span>
                </p>
                <p>PNG, JPG, SVG up to 3MB</p>
              </div>
              <Button type='button' variant='outline' size='sm'>
                <UploadIcon className='mr-2 h-4 w-4' />
                Select file
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
