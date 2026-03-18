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
import { useTranslate } from '@/hooks/use-translate';
import { type LocalizedText } from '@/lib/helpers';
import { ArrowLeft, Save, HelpCircle } from 'lucide-react';

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
  const { t } = useTranslate();
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
                  <TabsTrigger value='en'>
                    {t('page.form.englishTab')}
                  </TabsTrigger>
                  <TabsTrigger value='km'>
                    {t('page.form.khmerTab')}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value='en'>
                  <div>
                    <Label htmlFor='title-en'>{t('page.form.pageTitle')}</Label>
                    <Input
                      id='title-en'
                      value={formData.title.en}
                      onChange={(e) => handleTitleChange('en', e.target.value)}
                      placeholder={t('page.form.enterTitle')}
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
                      <Label htmlFor='metaTitle-en'>
                        {t('page.form.metaTitle')}
                      </Label>
                      <Input
                        id='metaTitle-en'
                        value={formData.metaTitle.en}
                        onChange={(e) =>
                          handleSeoChange('metaTitle', 'en', e.target.value)
                        }
                        placeholder={t('page.form.enterMetaTitle')}
                        className='mt-1'
                      />
                      <p className='text-muted-foreground mt-1 text-xs'>
                        {formData.metaTitle.en.length}/60 characters
                      </p>
                    </div>
                    <div>
                      <Label htmlFor='metaDescription-en'>
                        {t('page.form.metaDescription')}
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
                        placeholder={t('page.form.enterMetaDescription')}
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
                    <Label htmlFor='title-km'>
                      {t('page.form.khmerTitle')}
                    </Label>
                    <Input
                      id='title-km'
                      value={formData.title.km}
                      onChange={(e) => handleTitleChange('km', e.target.value)}
                      placeholder={t('page.form.enterKhmerTitle')}
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
                      <Label htmlFor='metaTitle-km'>
                        {t('page.form.metaTitle')}
                      </Label>
                      <Input
                        id='metaTitle-km'
                        value={formData.metaTitle.km}
                        onChange={(e) =>
                          handleSeoChange('metaTitle', 'km', e.target.value)
                        }
                        placeholder={t('page.form.enterKhmerMetaTitle')}
                        className='mt-1'
                      />
                      <p className='text-muted-foreground mt-1 text-xs'>
                        {formData.metaTitle.km.length}/60 characters
                      </p>
                    </div>
                    <div>
                      <Label htmlFor='metaDescription-km'>
                        {t('page.form.metaDescription')}
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
                        placeholder={t('page.form.enterKhmerMetaDescription')}
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
                  {t('page.form.urlSlug')}
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
                    placeholder={t('page.form.slugAutoGenerated')}
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
              <CardTitle className='text-sm'>
                {t('page.form.publishSettings')}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Label htmlFor='status'>{t('page.form.status')}</Label>
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
                        {t('page.status.draft')}
                      </div>
                    </SelectItem>
                    <SelectItem value='published'>
                      <div className='flex items-center gap-2'>
                        <div className='h-2 w-2 rounded-full bg-green-500'></div>
                        {t('page.status.published')}
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
                  {editingPage
                    ? t('page.form.updateSubmit')
                    : t('page.form.createSubmit')}
                </Button>
                <Button variant='outline' onClick={onCancel} className='w-full'>
                  <ArrowLeft />
                  {t('page.form.cancel')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
