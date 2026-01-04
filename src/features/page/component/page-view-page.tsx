'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageForm } from './page-form';
import {
  createPage,
  getPageById,
  updatePage,
  type PageInput
} from '@/server/action/page/page';

type PageStatus = 'draft' | 'published';

type PageEntity = {
  id?: string;
  title: string;
  content?: string;
  status: PageStatus;
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
};

type PageFormData = {
  title: string;
  content: string;
  status: PageStatus | string; // keep flexible if your form returns string
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
};

function getErrorMessage(e: any, fallback = 'Something went wrong') {
  // Typical Server Action error
  if (typeof e?.message === 'string' && e.message.trim()) return e.message;

  // Axios-like error
  const resp = e?.response?.data;
  return resp?.message || resp?.error || fallback;
}

export default function PageViewPage({ pageId }: { pageId: string }) {
  const router = useRouter();
  const qc = useQueryClient();

  const isNew = useMemo(() => pageId === 'new', [pageId]);

  const [editingPage, setEditingPage] = useState<PageEntity | null>(null);
  const [loading, setLoading] = useState<boolean>(!isNew);

  useEffect(() => {
    let cancelled = false;

    if (isNew) {
      setEditingPage(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    void (async () => {
      try {
        const res = await getPageById(pageId);
        if (cancelled) return;

        const data = (res as any)?.data ?? res;

        if (!data) {
          toast.error('Page not found');
          router.replace('/admin/page');
          return;
        }

        setEditingPage(data as PageEntity);
      } catch (e: any) {
        if (cancelled) return;
        toast.error(getErrorMessage(e, 'Failed to load page'));
        router.replace('/admin/page');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isNew, pageId, router]);

  const handleSave = useCallback(
    async (formData: PageFormData) => {
      try {
        // ✅ Fix: force status to be the literal union type
        const status: PageStatus =
          formData.status === 'published' ? 'published' : 'draft';

        // ✅ Fix: explicitly type payload as PageInput
        const payload: PageInput = {
          title: formData.title,
          content: formData.content,
          status,
          metaTitle: formData.seo?.metaTitle,
          metaDescription: formData.seo?.metaDescription
        };

        if (isNew) {
          await createPage(payload);
          toast.success('Page created');
        } else {
          await updatePage(pageId, payload);
          toast.success('Page updated');
        }

        qc.invalidateQueries({ queryKey: ['pages'] });
        qc.invalidateQueries({ queryKey: ['page', pageId] }); // optional
        router.replace('/admin/page');
      } catch (e: any) {
        const message = getErrorMessage(e, 'Save failed');
        // eslint-disable-next-line no-console
        console.error('[PageView] SAVE error', e);
        toast.error(message);
      }
    },
    [isNew, pageId, qc, router]
  );

  const handleCancel = useCallback(() => {
    router.push('/admin/page');
  }, [router]);

  if (loading) return null;

  return (
    <PageForm
      editingPage={editingPage}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
