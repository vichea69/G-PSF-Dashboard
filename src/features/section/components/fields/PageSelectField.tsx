import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useLanguage } from '@/context/language-context';
import { getLocalizedText } from '@/lib/helpers';
import type { Control } from 'react-hook-form';

import type { SectionFormValues } from '../section-form.schema';

type Props = {
  control: Control<SectionFormValues>;
  pages: any[];
};

export function PageSelectField({ control, pages }: Props) {
  const { language } = useLanguage();

  return (
    <FormField
      control={control}
      name='pageId'
      render={({ field }) => (
        <FormItem className='flex-1'>
          <FormLabel>Page</FormLabel>
          <Select
            value={field.value ? String(field.value) : ''}
            onValueChange={(value) => field.onChange(Number(value))}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder='Select page' />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {pages.length ? (
                pages.map((page) => {
                  const label =
                    getLocalizedText(page?.title, language) ||
                    page?.slug ||
                    `Page ${page?.id ?? ''}`;
                  return (
                    <SelectItem key={page?.id} value={String(page?.id)}>
                      {label}
                    </SelectItem>
                  );
                })
              ) : (
                <SelectItem value='0' disabled>
                  No pages available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
