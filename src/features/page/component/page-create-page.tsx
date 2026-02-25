'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageForm, type PageFormData } from './page-form';
import { createPage, type PageInput } from '@/server/action/page/page';

const getErrorMessage = (e: any, fallback = 'Something went wrong') => {
  if (typeof e?.message === 'string' && e.message.trim()) return e.message;
  const resp = e?.response?.data;
  if (typeof resp?.message === 'string' && resp.message.trim()) {
    return resp.message;
  }
  if (Array.isArray(resp?.message) && resp.message.length > 0) {
    return resp.message.join(', ');
  }
  if (typeof resp?.error === 'string' && resp.error.trim()) return resp.error;
  return fallback;
};

export default function PageCreatePage() {
  const router = useRouter();
  const qc = useQueryClient();

  const handleSave = useCallback(
    async (formData: PageFormData) => {
      try {
        const payload: PageInput = {
          title: formData.title,
          status: formData.status === 'published' ? 'published' : 'draft',
          metaTitle: formData.metaTitle,
          metaDescription: formData.metaDescription,
          slug: formData.slug
        };

        await createPage(payload);
        toast.success('Page created');
        qc.invalidateQueries({ queryKey: ['pages'] });
        router.replace('/admin/page');
      } catch (error: any) {
        toast.error(getErrorMessage(error, 'Failed to create page'));
      }
    },
    [qc, router]
  );

  const handleCancel = useCallback(() => {
    router.push('/admin/page');
  }, [router]);

  return <PageForm onSave={handleSave} onCancel={handleCancel} />;
}
