'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type LocalizedText } from '@/lib/helpers';
import { ArrowLeft, Save, Eye, HelpCircle } from 'lucide-react';

type Locale = 'en' | 'km';
type LocalizedFormField = Record<Locale, string>;
type SeoField = 'metaTitle' | 'metaDescription';

export type PageFormData = {
  title: LocalizedFormField;
  slug: string;
  status: 'published' | 'draft';
  metaTitle: LocalizedFormField;
  metaDescription: LocalizedFormField;
};

export type PageFormEditingData = {
  id?: string | number;
  title?: LocalizedText;
  slug?: string;
  status?: 'published' | 'draft';
  metaTitle?: LocalizedText;
  metaDescription?: LocalizedText;
  seo?: {
    metaTitle?: LocalizedText;
    metaDescription?: LocalizedText;
  };
};

interface PageFormProps {
  editingPage?: PageFormEditingData | null;
  onSave: (pageData: PageFormData) => void;
  onCancel: () => void;
}

const createEmptyLocalizedField = (): LocalizedFormField => ({
  en: '',
  km: ''
});

const normalizeLocalizedText = (value?: LocalizedText): LocalizedFormField => {
  if (typeof value === 'string') {
    return { en: value, km: '' };
  }

  if (!value || typeof value !== 'object') {
    return createEmptyLocalizedField();
  }

  return {
    en: value.en ?? '',
    km: value.km ?? ''
  };
};

const createInitialFormData = (
  page?: PageFormEditingData | null
): PageFormData => ({
  title: normalizeLocalizedText(page?.title),
  slug: typeof page?.slug === 'string' ? page.slug : '',
  status:
    page?.status === 'published' || page?.status === 'draft'
      ? page.status
      : 'draft',
  metaTitle: normalizeLocalizedText(page?.metaTitle ?? page?.seo?.metaTitle),
  metaDescription: normalizeLocalizedText(
    page?.metaDescription ?? page?.seo?.metaDescription
  )
});

const generateSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export function PageForm({ editingPage, onSave, onCancel }: PageFormProps) {
  const [formData, setFormData] = useState<PageFormData>(() =>
    createInitialFormData(editingPage)
  );
  const [activeLocale, setActiveLocale] = useState<Locale>('en');

  useEffect(() => {
    setFormData(createInitialFormData(editingPage));
  }, [editingPage]);

  const handleTitleChange = (locale: Locale, value: string) => {
    setFormData((prev) => {
      const nextTitle = { ...prev.title, [locale]: value };
      const shouldUpdateSlug = locale === 'en';
      const nextSlug = shouldUpdateSlug ? generateSlug(value) : prev.slug;

      const nextMetaTitle: LocalizedFormField = {
        ...prev.metaTitle,
        en:
          locale === 'en' &&
          (!prev.metaTitle.en || prev.metaTitle.en === prev.title.en)
            ? value
            : prev.metaTitle.en
      };

      return {
        ...prev,
        title: nextTitle,
        slug: shouldUpdateSlug ? nextSlug : prev.slug,
        metaTitle: nextMetaTitle
      };
    });
  };

  const handleSeoChange = (field: SeoField, locale: Locale, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [locale]: value
      }
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='space-y-6 lg:col-span-2'>
          <Card>
            <CardContent className='space-y-6'>
              <Tabs
                value={activeLocale}
                onValueChange={(value) => setActiveLocale(value as Locale)}
              >
                <TabsList>
                  <TabsTrigger value='en'>English</TabsTrigger>
                  <TabsTrigger value='km'>Khmer</TabsTrigger>
                </TabsList>
                <TabsContent value='en'>
                  <div>
                    <Label htmlFor='title-en'>Page Title</Label>
                    <Input
                      id='title-en'
                      value={formData.title.en}
                      onChange={(e) => handleTitleChange('en', e.target.value)}
                      placeholder='Enter a clear, descriptive title'
                      className='mt-1'
                    />
                  </div>
                  <div className='border-border space-y-4 pt-4'>
                    {/* <div>
                      <p className='text-sm font-semibold'>SEO Settings</p>
                      <p className='text-muted-foreground text-xs'>
                        Help search engines understand your page
                      </p>
                    </div> */}
                    <div>
                      <Label htmlFor='metaTitle-en'>Meta Title</Label>
                      <Input
                        id='metaTitle-en'
                        value={formData.metaTitle.en}
                        onChange={(e) =>
                          handleSeoChange('metaTitle', 'en', e.target.value)
                        }
                        placeholder='Enter meta title'
                        className='mt-1'
                      />
                      <p className='text-muted-foreground mt-1 text-xs'>
                        {formData.metaTitle.en.length}/60 characters
                      </p>
                    </div>
                    <div>
                      <Label htmlFor='metaDescription-en'>
                        Meta Description
                      </Label>
                      <Textarea
                        id='metaDescription-en'
                        value={formData.metaDescription.en}
                        onChange={(e) =>
                          handleSeoChange(
                            'metaDescription',
                            'en',
                            e.target.value
                          )
                        }
                        placeholder='Enter meta description'
                        rows={3}
                        className='mt-1'
                      />
                      <p className='text-muted-foreground mt-1 text-xs'>
                        {formData.metaDescription.en.length}/160 characters
                      </p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value='km'>
                  <div>
                    <Label htmlFor='title-km'>Khmer Title</Label>
                    <Input
                      id='title-km'
                      value={formData.title.km}
                      onChange={(e) => handleTitleChange('km', e.target.value)}
                      placeholder='ឈ្មោះទំព័រ'
                      className='mt-1'
                    />
                  </div>
                  <div className='border-border space-y-4 pt-4'>
                    {/* <div>
                      <p className='text-sm font-semibold'>SEO Settings</p>
                      <p className='text-muted-foreground text-xs'>
                        Help search engines understand your page
                      </p>
                    </div> */}
                    <div>
                      <Label htmlFor='metaTitle-km'>Meta Title</Label>
                      <Input
                        id='metaTitle-km'
                        value={formData.metaTitle.km}
                        onChange={(e) =>
                          handleSeoChange('metaTitle', 'km', e.target.value)
                        }
                        placeholder='បញ្ចូលចំណងជើង'
                        className='mt-1'
                      />
                      <p className='text-muted-foreground mt-1 text-xs'>
                        {formData.metaTitle.km.length}/60 characters
                      </p>
                    </div>
                    <div>
                      <Label htmlFor='metaDescription-km'>
                        Meta Description
                      </Label>
                      <Textarea
                        id='metaDescription-km'
                        value={formData.metaDescription.km}
                        onChange={(e) =>
                          handleSeoChange(
                            'metaDescription',
                            'km',
                            e.target.value
                          )
                        }
                        placeholder='បញ្ចូលពិពណ៌នា'
                        rows={3}
                        className='mt-1'
                      />
                      <p className='text-muted-foreground mt-1 text-xs'>
                        {formData.metaDescription.km.length}/160 characters
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div>
                <Label htmlFor='slug' className='flex items-center gap-2'>
                  URL Slug
                  <HelpCircle className='text-muted-foreground h-3 w-3' />
                </Label>
                <div className='mt-1 flex items-center'>
                  <span className='text-muted-foreground bg-muted rounded-l-md border border-r-0 px-3 py-2 text-sm'>
                    /
                  </span>
                  <Input
                    id='slug'
                    value={formData.slug}
                    readOnly
                    placeholder='auto-generated from title'
                    className='rounded-l-none'
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='text-sm'>Publish Settings</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Label htmlFor='status'>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: value as PageFormData['status']
                    }))
                  }
                >
                  <SelectTrigger className='mt-1'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='draft'>
                      <div className='flex items-center gap-2'>
                        <div className='h-2 w-2 rounded-full bg-amber-500'></div>
                        Draft
                      </div>
                    </SelectItem>
                    <SelectItem value='published'>
                      <div className='flex items-center gap-2'>
                        <div className='h-2 w-2 rounded-full bg-green-500'></div>
                        Published
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='space-y-3'>
                <Button onClick={handleSubmit} className='w-full'>
                  <Save />
                  {editingPage ? 'Update Page' : 'Create Page'}
                </Button>

                {editingPage && (
                  <Button variant='outline' className='w-full bg-transparent'>
                    <Eye className='mr-2 h-4 w-4' />
                    Preview Changes
                  </Button>
                )}

                <Button variant='outline' onClick={onCancel} className='w-full'>
                  <ArrowLeft />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
