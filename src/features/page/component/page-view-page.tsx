'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageForm, type PageFormData } from './page-form';
import {
  createPage,
  getPageById,
  updatePage,
  type PageInput
} from '@/server/action/page/page';
import type { LocalizedText } from '@/lib/helpers';

type PageStatus = 'draft' | 'published';

type PageEntity = {
  id?: string;
  title?: LocalizedText;
  slug?: string;
  status?: PageStatus;
  content?: string;
  seo?: {
    metaTitle?: LocalizedText;
    metaDescription?: LocalizedText;
  };
  metaTitle?: LocalizedText;
  metaDescription?: LocalizedText;
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
        const status: PageStatus =
          formData.status === 'published' ? 'published' : 'draft';

        const payload: PageInput = {
          title: formData.title,
          status,
          metaTitle: formData.metaTitle,
          metaDescription: formData.metaDescription
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
