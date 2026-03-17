'use client';
import { CheckIcon } from '@radix-ui/react-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
  Form,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/context/language-context';
import { extractPageRows, usePage } from '@/hooks/use-page';
import { cn } from '@/lib/utils';
import { getLocalizedText } from '@/lib/helpers';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm, type Control } from 'react-hook-form';
import * as z from 'zod';
import type { Category } from '@/server/action/category/types';
import { toast } from 'sonner';
import type { LocalizedText } from '@/lib/helpers';
import {
  createCategory,
  updateCategory
} from '@/server/action/category/category';

const formSchema = z.object({
  name: z.object({
    en: z
      .string()
      .min(2, { message: 'English name must be at least 2 characters.' }),
    km: z.string().optional()
  }),
  description: z.object({
    en: z.string().optional(),
    km: z.string().optional()
  }),
  pageIds: z.array(z.number().int().positive()).default([])
});

type CategoryFormValues = z.infer<typeof formSchema>;
type CategoryPayload = {
  name: {
    en: string;
    km?: string;
  };
  description?: {
    en?: string;
    km?: string;
  };
  pageIds: number[];
};

type PageOption = {
  value: number;
  label: string;
};

const getLocalizedValue = (value: LocalizedText, key: 'en' | 'km') => {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return '';
  const candidate = value[key];
  return typeof candidate === 'string' ? candidate : '';
};

const toPositiveNumber = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.floor(parsed);
};

const getInitialPageIds = (initialData: Category | null) => {
  const rawPageIds = Array.isArray(initialData?.pageIds)
    ? initialData.pageIds
    : Array.isArray(initialData?.pages)
      ? initialData.pages.map((page) => page?.id)
      : Array.isArray(initialData?.relation?.pages)
        ? initialData.relation.pages.map((page) => page?.id)
        : [];

  return rawPageIds
    .map(toPositiveNumber)
    .filter((value): value is number => value !== null);
};

function PageIdsField({
  control,
  pageOptions
}: {
  control: Control<CategoryFormValues>;
  pageOptions: PageOption[];
}) {
  return (
    <FormField
      control={control}
      name='pageIds'
      render={({ field }) => {
        const selectedIds = field.value ?? [];
        const selectedCount = selectedIds.length;
        const selectedOptions = pageOptions.filter((option) =>
          selectedIds.includes(option.value)
        );

        return (
          <FormItem>
            <FormLabel>Pages</FormLabel>
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
                        {selectedCount > 2 ? (
                          <Badge
                            variant='secondary'
                            className='rounded-sm px-1 font-normal'
                          >
                            {selectedCount - 2}+ more
                          </Badge>
                        ) : null}
                      </div>
                    ) : (
                      <span className='text-muted-foreground'>
                        Select pages
                      </span>
                    )}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className='w-[260px] p-0' align='start'>
                <Command>
                  <CommandInput placeholder='Search pages...' />
                  <CommandList>
                    <CommandEmpty>No pages found.</CommandEmpty>
                    <CommandGroup className='max-h-[18.75rem] overflow-x-hidden overflow-y-auto'>
                      {pageOptions.map((option) => {
                        const isSelected = selectedIds.includes(option.value);

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
  );
}

export default function CategoryForm({
  initialData
}: {
  initialData: Category | null;
}) {
  const router = useRouter();
  const { language } = useLanguage();
  const { data: pagesData } = usePage();
  const [submitting, setSubmitting] = useState(false);
  const initialValues = useMemo<CategoryFormValues>(
    () => ({
      name: {
        en: getLocalizedValue(initialData?.name, 'en'),
        km: getLocalizedValue(initialData?.name, 'km')
      },
      description: {
        en: getLocalizedValue(initialData?.description, 'en'),
        km: getLocalizedValue(initialData?.description, 'km')
      },
      pageIds: getInitialPageIds(initialData)
    }),
    [initialData]
  );
  const pageOptions = useMemo<PageOption[]>(() => {
    const rows = extractPageRows(pagesData);

    return rows
      .map((page) => {
        const id = toPositiveNumber(page?.id);
        if (!id) return null;

        return {
          value: id,
          label:
            getLocalizedText(page?.title, language) ||
            String(page?.slug ?? `Page ${id}`)
        };
      })
      .filter((option): option is PageOption => Boolean(option));
  }, [pagesData, language]);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues
  });

  useEffect(() => {
    form.reset(initialValues);
  }, [form, initialValues]);

  const qc = useQueryClient();
  const createMutation = useMutation({
    mutationFn: (values: CategoryPayload) => createCategory(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created successfully');
      router.replace('/admin/category');
    }
  });
  const updateMutation = useMutation({
    // Send only editable fields; avoid server-managed fields causing 400
    mutationFn: (values: CategoryPayload) => {
      if (!initialData?.id) {
        throw new Error('Category id is required');
      }
      return updateCategory(String(initialData.id), values);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated successfully');
      router.replace('/admin/category');
    }
  });

  async function onSubmit(values: CategoryFormValues) {
    setSubmitting(true);
    try {
      const nameEn = values.name.en.trim();
      const nameKm = values.name.km?.trim() ?? '';
      const descriptionEn = values.description.en?.trim() ?? '';
      const descriptionKm = values.description.km?.trim() ?? '';

      const payload: CategoryPayload = {
        name: {
          en: nameEn,
          ...(nameKm ? { km: nameKm } : {})
        },
        ...(descriptionEn || descriptionKm
          ? {
              description: {
                ...(descriptionEn ? { en: descriptionEn } : {}),
                ...(descriptionKm ? { km: descriptionKm } : {})
              }
            }
          : {}),
        pageIds: values.pageIds
      };

      if (initialData?.id) await updateMutation.mutateAsync(payload);
      else await createMutation.mutateAsync(payload);
    } finally {
      setSubmitting(false);
    }
  }

  // Deletion is available in the row action menu

  // Delete handled elsewhere (row actions). Keep here if you add a Delete button in this form.

  return (
    <Card className='mx-auto w-full'>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <Tabs defaultValue='en' className='space-y-4'>
              <TabsList>
                <TabsTrigger value='en'>English</TabsTrigger>
                <TabsTrigger value='km'>Khmer</TabsTrigger>
              </TabsList>

              <TabsContent value='en' className='space-y-4'>
                <FormField
                  control={form.control}
                  name='name.en'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder='' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='description.en'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder=''
                          className='resize-none'
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
                  control={form.control}
                  name='name.km'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name </FormLabel>
                      <FormControl>
                        <Input placeholder='' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='description.km'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder=''
                          className='resize-none'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <PageIdsField control={form.control} pageOptions={pageOptions} />

            <div className='flex items-center gap-2'>
              <Button type='submit' disabled={submitting}>
                {initialData ? 'Save Changes' : 'Create Category'}
              </Button>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.push('/admin/category')}
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
