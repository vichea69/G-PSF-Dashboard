'use client';

import type { Control, FieldValues } from 'react-hook-form';
import { CheckIcon } from '@radix-ui/react-icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useTranslate } from '@/hooks/use-translate';
import { cn } from '@/lib/utils';

type CategoryOption = {
  value: number;
  label: string;
};

type PostListFormProps = {
  control: Control<FieldValues>;
  categoryOptions: CategoryOption[];
};

export function PostListForm({ control, categoryOptions }: PostListFormProps) {
  const { t } = useTranslate();

  return (
    <div className='space-y-4 rounded-lg border p-4'>
      <div>
        <h3 className='text-sm font-medium'>
          {t('section.form.settingsTitle')}
        </h3>
        <p className='text-muted-foreground text-xs'>
          {t('section.form.settingsDescription')}
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        <FormField
          control={control}
          name='settings.sort'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('section.form.sort')}</FormLabel>
              <Select value={field.value ?? ''} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('section.form.selectSort')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='manual'>
                    {t('section.form.manual')}
                  </SelectItem>
                  <SelectItem value='latest'>
                    {t('section.form.latest')}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name='settings.limit'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('section.form.limit')}</FormLabel>
              <FormControl>
                <Input type='number' placeholder='0' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name='settings.categoryIds'
          render={({ field }) => {
            const selectedIds = field.value ?? [];
            const selectedCount = selectedIds.length;
            const selectedOptions = categoryOptions.filter((option) =>
              selectedIds.includes(option.value)
            );

            return (
              <FormItem>
                <FormLabel>{t('section.form.categories')}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        type='button'
                        variant='outline'
                        className='w-full justify-between'
                      >
                        {selectedCount ? (
                          <div className='flex flex-wrap gap-1'>
                            {selectedOptions.slice(0, 2).map((option) => (
                              <Badge
                                key={option.value}
                                variant='secondary'
                                className='rounded-sm px-1 font-normal'
                              >
                                {option.label}
                              </Badge>
                            ))}
                            {selectedCount > 2 && (
                              <Badge
                                variant='secondary'
                                className='rounded-sm px-1 font-normal'
                              >
                                {selectedCount - 2}+ {t('section.form.more')}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className='text-muted-foreground'>
                            {t('section.form.selectCategories')}
                          </span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-[240px] p-0' align='start'>
                    <Command>
                      <CommandInput
                        placeholder={t('section.form.searchCategories')}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {t('section.form.noCategoriesFound')}
                        </CommandEmpty>
                        <CommandGroup className='max-h-[18.75rem] overflow-x-hidden overflow-y-auto'>
                          {categoryOptions.map((option) => {
                            const isSelected = selectedIds.includes(
                              option.value
                            );
                            return (
                              <CommandItem
                                key={option.value}
                                onSelect={() => {
                                  const next = new Set(selectedIds);
                                  if (isSelected) {
                                    next.delete(option.value);
                                  } else {
                                    next.add(option.value);
                                  }
                                  field.onChange(Array.from(next));
                                }}
                              >
                                <div
                                  className={cn(
                                    'border-primary flex size-4 items-center justify-center rounded-sm border',
                                    isSelected
                                      ? 'bg-primary text-primary-foreground'
                                      : 'opacity-50 [&_svg]:invisible'
                                  )}
                                >
                                  <CheckIcon />
                                </div>
                                <span className='truncate'>{option.label}</span>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                        {selectedCount ? (
                          <>
                            <CommandSeparator />
                            <CommandGroup>
                              <CommandItem
                                onSelect={() => field.onChange([])}
                                className='justify-center text-center'
                              >
                                {t('section.form.clearSelection')}
                              </CommandItem>
                            </CommandGroup>
                          </>
                        ) : null}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                <FormMessage />
              </FormItem>
            );
          }}
        />
      </div>
    </div>
  );
}
