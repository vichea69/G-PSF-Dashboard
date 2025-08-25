'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { api } from '@/lib/api';
import type { Category } from '@/server/action/category/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  description: z.string().optional()
});

export default function CategoryForm({
  initialData,
  pageTitle
}: {
  initialData: Category | null;
  pageTitle: string;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      name: initialData?.name ?? '',
      description: initialData?.description ?? ''
    }
  });

  const qc = useQueryClient();
  const createMutation = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) =>
      api.post(`/categories`, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category created successfully');
      router.replace('/admin/category');
    }
  });
  const updateMutation = useMutation({
    // Send only editable fields; avoid server-managed fields causing 400
    mutationFn: (values: z.infer<typeof formSchema>) =>
      api.put(`/categories/${initialData?.id}`, values),
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
      <CardHeader>
        <CardTitle className='text-left text-2xl font-bold'>
          {pageTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Category name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Description (optional)'
                      className='resize-none'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
