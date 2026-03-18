import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useTranslate } from '@/hooks/use-translate';
import type { Control } from 'react-hook-form';

import type { SectionFormValues } from '../section-form.schema';

type Props = {
  control: Control<SectionFormValues>;
};

export function OrderEnabledRow({ control }: Props) {
  const { t } = useTranslate();

  return (
    <>
      <div className='grid gap-4 md:grid-cols-2'>
        <FormField
          control={control}
          name='orderIndex'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('section.form.orderIndex')}</FormLabel>
              <FormControl>
                <Input type='number' placeholder='0' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name='enabled'
        render={({ field }) => (
          <FormItem className='flex items-center justify-between rounded-lg border p-4'>
            <div className='space-y-1'>
              <FormLabel>{t('section.form.enabled')}</FormLabel>
              <FormDescription>
                {t('section.form.enabledDescription')}
              </FormDescription>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );
}
