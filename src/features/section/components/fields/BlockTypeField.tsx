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
import { useTranslate } from '@/hooks/use-translate';
import type { Control } from 'react-hook-form';

import {
  blockTypeLabel,
  blockTypes,
  type SectionFormValues
} from '../section-form.schema';

type Props = {
  control: Control<SectionFormValues>;
};

export function BlockTypeField({ control }: Props) {
  const { t } = useTranslate();

  return (
    <FormField
      control={control}
      name='blockType'
      render={({ field }) => (
        <FormItem className='flex-1'>
          <FormLabel>{t('section.form.blockType')}</FormLabel>
          <Select value={field.value} onValueChange={field.onChange}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={t('section.form.selectBlockType')} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {blockTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {blockTypeLabel[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
