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
  return (
    <div className='space-y-4 rounded-lg border p-4'>
      <div>
        <h3 className='text-sm font-medium'>Settings</h3>
        <p className='text-muted-foreground text-xs'>
          Configure optional section behavior.
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        <FormField
          control={control}
          name='settings.sort'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sort</FormLabel>
              <Select value={field.value ?? ''} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select sort' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='manual'>Manual</SelectItem>
                  <SelectItem value='latest'>Latest</SelectItem>
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
              <FormLabel>Limit</FormLabel>
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
                <FormLabel>Categories</FormLabel>
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
                                {selectedCount - 2}+ more
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className='text-muted-foreground'>
                            Select categories
                          </span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className='w-[240px] p-0' align='start'>
                    <Command>
                      <CommandInput placeholder='Search categories...' />
                      <CommandList>
                        <CommandEmpty>No categories found.</CommandEmpty>
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
                                Clear selection
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
