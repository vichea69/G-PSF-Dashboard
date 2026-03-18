import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTranslate } from '@/hooks/use-translate';
import type { Control } from 'react-hook-form';

import type { SectionFormValues } from '../section-form.schema';

type Props = {
  control: Control<SectionFormValues>;
  activeLanguage: 'en' | 'km';
  onLanguageChange: (lang: 'en' | 'km') => void;
};

export function LocalizedFields({
  control,
  activeLanguage,
  onLanguageChange
}: Props) {
  const { t } = useTranslate();

  return (
    <Tabs
      value={activeLanguage}
      onValueChange={(value) => onLanguageChange(value as 'en' | 'km')}
      className='space-y-4'
    >
      <TabsList>
        <TabsTrigger value='en'>{t('section.form.englishTab')}</TabsTrigger>
        <TabsTrigger value='km'>{t('section.form.khmerTab')}</TabsTrigger>
      </TabsList>

      <TabsContent value='en' className='space-y-4'>
        <FormField
          control={control}
          name='title.en'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('section.form.title')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('section.form.titlePlaceholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name='description.en'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('section.form.description')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('section.form.descriptionPlaceholder')}
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TabsContent>

      <TabsContent value='km' className='space-y-4'>
        <FormField
          control={control}
          name='title.km'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('section.form.titleKhmer')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('section.form.titleKhmerPlaceholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name='description.km'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('section.form.descriptionKhmer')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('section.form.descriptionKhmerPlaceholder')}
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TabsContent>
    </Tabs>
  );
}
