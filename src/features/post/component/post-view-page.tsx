'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import PostForm, { type PostFormData } from './post-form';
import { api } from '@/lib/api';

export default function PostViewPage({ postId }: { postId: string }) {
  const isNew = postId === 'new';
  const [editingPost, setEditingPost] = useState<any>(isNew ? null : undefined);
  const [loading, setLoading] = useState(!isNew);
  const router = useRouter();
  const qc = useQueryClient();

  useEffect(() => {
    let cancelled = false;
    if (!isNew) {
      setLoading(true);
      const id = String(postId);
      const url = `/posts/${encodeURIComponent(id)}`;
      // eslint-disable-next-line no-console
      console.log('[PostView] GET', `${api.defaults.baseURL ?? ''}${url}`);
      api
        .get(url)
        .then((res) => {
          if (cancelled) return;
          const data = res.data?.data ?? res.data;
          // eslint-disable-next-line no-console
          console.log('[PostView] GET success', { status: res.status, data });
          if (!data) {
            toast.error('Post not found');
            router.replace('/admin/post');
            return;
          }
          setEditingPost(data);
        })
        .catch((e: any) => {
          if (cancelled) return;
          const status = e?.response?.status;
          const err = e?.response?.data || e?.message;
          // eslint-disable-next-line no-console
          console.error('[PostView] GET error', { status, url, err });
          toast.error('Failed to load post');
          router.replace('/admin/post');
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }
    return () => {
      cancelled = true;
    };
  }, [isNew, postId, router]);

  const handleSave = useCallback(
    async (formData: PostFormData) => {
      try {
        // Log all information received from the form
        // eslint-disable-next-line no-console
        console.log('[PostView] FORM DATA', formData);

        const fd = new FormData();
        fd.append('title', formData.title);
        if (formData.content) fd.append('content', formData.content);
        fd.append('status', formData.status);
        if (formData.categoryId !== undefined && formData.categoryId !== null)
          fd.append('categoryId', String(formData.categoryId));
        if (formData.pageId !== undefined && formData.pageId !== null)
          fd.append('pageId', String(formData.pageId));
        if (formData.image) fd.append('image', formData.image);
        const config = {
          headers: { 'Content-Type': 'multipart/form-data' }
        } as const;
        if (isNew) {
          // eslint-disable-next-line no-console
          console.log('[PostView] POST', `${api.defaults.baseURL ?? ''}/posts`);
          await api.post('/posts', fd, config);
          toast.success('Post created');
        } else {
          const url = `/posts/${encodeURIComponent(String(postId))}`;
          // eslint-disable-next-line no-console
          console.log('[PostView] PUT', `${api.defaults.baseURL ?? ''}${url}`);
          await api.put(url, fd, config);
          toast.success('Post updated');
        }
        qc.invalidateQueries({ queryKey: ['posts'] });
        router.replace('/admin/post');
      } catch (e: any) {
        const resp = e?.response?.data;
        const message =
          resp?.message || resp?.error || e?.message || 'Save failed';
        // eslint-disable-next-line no-console
        console.error('[PostView] SAVE error', {
          status: e?.response?.status,
          data: resp,
          message
        });
        toast.error(message);
      }
    },
    [isNew, postId, qc, router]
  );

  const handleCancel = useCallback(() => {
    router.push('/admin/post');
  }, [router]);

  if (loading) return null;

  return (
    <PostForm
      editingPost={editingPost}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
