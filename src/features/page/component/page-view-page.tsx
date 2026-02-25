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
  _id?: string;
  pageId?: string | number;
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

function resolveEntityId(entity?: PageEntity | null) {
  const rawId = entity?.id ?? entity?._id ?? entity?.pageId ?? '';
  return String(rawId).trim();
}

export default function PageViewPage({ pageId }: { pageId: string }) {
  const router = useRouter();
  const qc = useQueryClient();

  const normalizedPageId = useMemo(() => String(pageId ?? '').trim(), [pageId]);
  const isNew = useMemo(() => normalizedPageId === 'new', [normalizedPageId]);

  const [editingPage, setEditingPage] = useState<PageEntity | null>(null);
  const [resolvedPageId, setResolvedPageId] =
    useState<string>(normalizedPageId);
  const [loading, setLoading] = useState<boolean>(!isNew);

  useEffect(() => {
    let cancelled = false;

    setResolvedPageId(normalizedPageId);

    if (isNew) {
      setEditingPage(null);
      setLoading(false);
      return;
    }

    if (!normalizedPageId) {
      toast.error('Page id is required');
      router.replace('/admin/page');
      return;
    }

    setLoading(true);

    void (async () => {
      try {
        const res = await getPageById(normalizedPageId);
        if (cancelled) return;

        const data = (res as any)?.data ?? res;

        if (!data) {
          toast.error('Page not found');
          router.replace('/admin/page');
          return;
        }

        setEditingPage(data as PageEntity);
        const entityId = resolveEntityId(data as PageEntity);
        if (entityId && !cancelled) {
          setResolvedPageId(entityId);
        }
      } catch (e: any) {
        if (cancelled) return;
        const status = e?.response?.status;
        if (status === 401) {
          toast.error('Your session expired. Please sign in again.');
        } else if (status === 404) {
          toast.error('Page not found');
        } else {
          toast.error(getErrorMessage(e, 'Failed to load page'));
        }
        router.replace('/admin/page');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isNew, normalizedPageId, router]);

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
          const targetPageId = resolvedPageId || normalizedPageId;
          if (!targetPageId) {
            throw new Error('Page id is required');
          }
          await updatePage(targetPageId, payload);
          toast.success('Page updated');
        }

        qc.invalidateQueries({ queryKey: ['pages'] });
        qc.invalidateQueries({
          queryKey: ['page', resolvedPageId || normalizedPageId]
        }); // optional
        router.replace('/admin/page');
      } catch (e: any) {
        const message = getErrorMessage(e, 'Save failed');
        // eslint-disable-next-line no-console
        console.error('[PageView] SAVE error', e);
        toast.error(message);
      }
    },
    [isNew, normalizedPageId, qc, resolvedPageId, router]
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
