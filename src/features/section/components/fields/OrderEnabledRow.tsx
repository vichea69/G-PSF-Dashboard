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
import type { Control } from 'react-hook-form';

import type { SectionFormValues } from '../section-form.schema';

type Props = {
  control: Control<SectionFormValues>;
};

export function OrderEnabledRow({ control }: Props) {
  return (
    <>
      <div className='grid gap-4 md:grid-cols-2'>
        <FormField
          control={control}
          name='orderIndex'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order Index</FormLabel>
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
              <FormLabel>Enabled</FormLabel>
              <FormDescription>
                Toggle to enable or disable this section.
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
