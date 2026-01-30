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
  return (
    <Tabs
      value={activeLanguage}
      onValueChange={(value) => onLanguageChange(value as 'en' | 'km')}
      className='space-y-4'
    >
      <TabsList>
        <TabsTrigger value='en'>English</TabsTrigger>
        <TabsTrigger value='km'>Khmer</TabsTrigger>
      </TabsList>

      <TabsContent value='en' className='space-y-4'>
        <FormField
          control={control}
          name='title.en'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder='Technology News' {...field} />
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder='Short description' rows={3} {...field} />
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
              <FormLabel>Title (Khmer)</FormLabel>
              <FormControl>
                <Input placeholder='ចំណងជើង' {...field} />
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
              <FormLabel>Description (Khmer)</FormLabel>
              <FormControl>
                <Textarea placeholder='សេចក្ដីពិពណ៌នា' rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </TabsContent>
    </Tabs>
  );
}
