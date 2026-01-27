'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { CheckIcon } from '@radix-ui/react-icons';
import { createSection, updateSection } from '@/server/action/section/section';
import type { Section, SectionPayload } from '@/server/action/section/types';
import { getLocalizedText, type LocalizedText } from '@/lib/helpers';
import { usePage } from '@/hooks/use-page';
import { useLanguage } from '@/context/language-context';
import { useCategory } from '@/hooks/use-category';
import { cn } from '@/lib/utils';

const blockTypes = [
  'hero_banner',
  'stats',
  'benefits',
  'post_list',
  'work_groups'
] as const;

const formSchema = z.object({
  pageId: z.coerce.number().int().positive({ message: 'Page is required.' }),
  blockType: z.enum(blockTypes, { required_error: 'Block type is required.' }),
  title: z.object({
    en: z.string().min(1, { message: 'English title is required.' }),
    km: z.string().optional()
  }),
  settings: z.object({
    sort: z.enum(['manual', 'latest']).optional(),
    limit: z.preprocess((value) => {
      if (value === '' || value === null || value === undefined)
        return undefined;
      const numberValue = Number(value);
      return Number.isFinite(numberValue) ? numberValue : undefined;
    }, z.number().int().nonnegative().optional()),
    categoryIds: z.array(z.number().int().positive()).optional()
  }),
  orderIndex: z.coerce
    .number()
    .int()
    .nonnegative()
    .min(0, { message: 'Order index must be 0 or higher.' }),
  enabled: z.boolean().default(true)
});

const getLocalizedValue = (value: LocalizedText, key: 'en' | 'km') => {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return '';
  const candidate = value[key];
  return typeof candidate === 'string' ? candidate : '';
};

const blockTypeLabel: Record<(typeof blockTypes)[number], string> = {
  hero_banner: 'Hero Banner',
  stats: 'Stats',
  benefits: 'Benefits',
  post_list: 'Post List',
  work_groups: 'Work Groups'
};

export default function SectionForm({
  initialData
}: {
  initialData: Section | null;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { data: pagesData } = usePage();
  const { data: categoriesData } = useCategory();
  const { language } = useLanguage();
  const pages = useMemo(
    () => ((pagesData as any)?.data ?? pagesData ?? []) as any[],
    [pagesData]
  );
  const categories = useMemo(
    () => ((categoriesData as any)?.data ?? categoriesData ?? []) as any[],
    [categoriesData]
  );
  const categoryOptions = useMemo(
    () =>
      categories
        .map((category) => ({
          value: Number(category?.id),
          label:
            getLocalizedText(category?.name, language) ||
            `Category ${category?.id ?? ''}`
        }))
        .filter((option) => Number.isFinite(option.value)),
    [categories, language]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      pageId: Number(initialData?.pageId ?? 0),
      blockType:
        (initialData?.blockType as (typeof blockTypes)[number]) ??
        'hero_banner',
      title: {
        en: getLocalizedValue(initialData?.title, 'en'),
        km: getLocalizedValue(initialData?.title, 'km')
      },
      settings: {
        sort: initialData?.settings?.sort,
        limit: initialData?.settings?.limit,
        categoryIds: initialData?.settings?.categoryIds ?? []
      },
      orderIndex: initialData?.orderIndex ?? 0,
      enabled: initialData?.enabled ?? true
    }
  });

  const qc = useQueryClient();
  const createMutation = useMutation({
    mutationFn: (values: SectionPayload) => createSection(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sections'] });
      toast.success('Section created successfully');
      router.replace('/admin/section');
    }
  });
  const updateMutation = useMutation({
    mutationFn: (values: SectionPayload) => {
      if (!initialData?.id) {
        throw new Error('Section id is required');
      }
      return updateSection(initialData.id, values);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sections'] });
      toast.success('Section updated successfully');
      router.replace('/admin/section');
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSubmitting(true);
    try {
      const titleEn = values.title.en?.trim() ?? '';
      const titleKm = values.title.km?.trim() ?? '';
      const title =
        titleEn || titleKm
          ? {
              en: titleEn || undefined,
              km: titleKm || undefined
            }
          : undefined;
      const categoryIds =
        values.settings.categoryIds && values.settings.categoryIds.length > 0
          ? values.settings.categoryIds
          : undefined;
      const settings =
        values.settings.sort ||
        values.settings.limit !== undefined ||
        categoryIds?.length
          ? {
              sort: values.settings.sort,
              limit: values.settings.limit,
              categoryIds
            }
          : undefined;
      const payload: SectionPayload = {
        pageId: values.pageId,
        blockType: values.blockType,
        title,
        settings,
        orderIndex: values.orderIndex,
        enabled: values.enabled
      };

      if (initialData?.id) await updateMutation.mutateAsync(payload);
      else await createMutation.mutateAsync(payload);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className='mx-auto w-full'>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='pageId'
              render={({ field }) => (
                <FormItem>
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

            <FormField
              control={form.control}
              name='blockType'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Block Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select block type' />
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

            <Tabs defaultValue='en' className='space-y-4'>
              <TabsList>
                <TabsTrigger value='en'>English</TabsTrigger>
                <TabsTrigger value='km'>Khmer</TabsTrigger>
              </TabsList>

              <TabsContent value='en' className='space-y-4'>
                <FormField
                  control={form.control}
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
              </TabsContent>

              <TabsContent value='km' className='space-y-4'>
                <FormField
                  control={form.control}
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
              </TabsContent>
            </Tabs>

            <div className='grid gap-4 md:grid-cols-2'>
              <FormField
                control={form.control}
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

            <div className='space-y-4 rounded-lg border p-4'>
              <div>
                <h3 className='text-sm font-medium'>Settings</h3>
                <p className='text-muted-foreground text-xs'>
                  Configure optional section behavior.
                </p>
              </div>

              <div className='grid gap-4 md:grid-cols-3'>
                <FormField
                  control={form.control}
                  name='settings.sort'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort</FormLabel>
                      <Select
                        value={field.value ?? ''}
                        onValueChange={field.onChange}
                      >
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
                  control={form.control}
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
                  control={form.control}
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
                                    {selectedOptions
                                      .slice(0, 2)
                                      .map((option) => (
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
                          <PopoverContent
                            className='w-[240px] p-0'
                            align='start'
                          >
                            <Command>
                              <CommandInput placeholder='Search categories...' />
                              <CommandList>
                                <CommandEmpty>
                                  No categories found.
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
                                        <span className='truncate'>
                                          {option.label}
                                        </span>
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

            <FormField
              control={form.control}
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
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className='flex items-center gap-2'>
              <Button type='submit' disabled={submitting}>
                {initialData ? 'Save Changes' : 'Create Section'}
              </Button>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.push('/admin/section')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
