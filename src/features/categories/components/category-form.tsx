'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import type { Category } from '@/server/action/category/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  })
});

export default function CategoryForm({
  initialData
}: {
  initialData: Category | null;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const getLocalizedValue = (value: LocalizedText, key: 'en' | 'km') => {
    if (typeof value === 'string') return value;
    if (!value || typeof value !== 'object') return '';
    const candidate = value[key];
    return typeof candidate === 'string' ? candidate : '';
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      name: {
        en: getLocalizedValue(initialData?.name, 'en'),
        km: getLocalizedValue(initialData?.name, 'km')
      },
      description: {
        en: getLocalizedValue(initialData?.description, 'en'),
        km: getLocalizedValue(initialData?.description, 'km')
      }
    }
  });

  const qc = useQueryClient();
  const createMutation = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) => createCategory(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created successfully');
      router.replace('/admin/category');
    }
  });
  const updateMutation = useMutation({
    // Send only editable fields; avoid server-managed fields causing 400
    mutationFn: (values: z.infer<typeof formSchema>) => {
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSubmitting(true);
    try {
      if (initialData?.id) await updateMutation.mutateAsync(values);
      else await createMutation.mutateAsync(values);
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
