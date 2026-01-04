'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import PostForm, { type PostFormData } from './post-form';
import { createPost, getPost, updatePost } from '@/server/action/post/post';

type PostViewPageProps = {
  postId: string;
  initialPost?: any | null;
};

export default function PostViewPage({
  postId: _postId,
  initialPost
}: PostViewPageProps) {
  const [editingPost, setEditingPost] = useState<any>(initialPost ?? null);
  const [isLoading, setIsLoading] = useState(_postId !== 'new' && !initialPost);
  const router = useRouter();
  const qc = useQueryClient();
  const isEditing = _postId !== 'new';

  useEffect(() => {
    if (!isEditing) {
      setEditingPost(null);
      return;
    }
    if (initialPost) {
      setEditingPost(initialPost);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    void (async () => {
      const result = await getPost(_postId);
      if (cancelled) return;
      if (result.success) {
        setEditingPost(result.data ?? null);
      } else {
        setEditingPost(null);
        toast.error(result.error ?? 'Failed to load post');
      }
      setIsLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [_postId, initialPost, isEditing]);

  const handleSave = useCallback(
    async (formData: PostFormData) => {
      try {
        // Log all information received from the form
        // eslint-disable-next-line no-console
        console.log('[PostView] FORM DATA', formData);

        const fd = new FormData();
        const trimmedTitle = formData.title.trim();
        fd.append('title', trimmedTitle);
        const contentField =
          typeof formData.content === 'string'
            ? formData.content.trim()
            : formData.content
              ? JSON.stringify(formData.content)
              : '';
        if (contentField) fd.append('content', contentField);
        fd.append('status', formData.status);
        if (formData.categoryId !== undefined && formData.categoryId !== null) {
          const categoryId = String(formData.categoryId).trim();
          if (categoryId) fd.append('categoryId', categoryId);
        }
        if (formData.pageId !== undefined && formData.pageId !== null) {
          const pageId = String(formData.pageId).trim();
          if (pageId) fd.append('pageId', pageId);
        }
        if (formData.newImages?.length) {
          formData.newImages.forEach((file) => {
            fd.append('images', file);
          });
        }
        // eslint-disable-next-line no-console
        console.log('[PostView] CREATE', 'server action');
        if (isEditing) {
          await updatePost(_postId, fd);
        } else {
          await createPost(fd);
        }
        toast.success(isEditing ? 'Post updated' : 'Post created');
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
    [_postId, isEditing, qc, router]
  );

  const handleCancel = useCallback(() => {
    router.push('/admin/post');
  }, [router]);

  if (isEditing && isLoading) {
    return (
      <div className='text-muted-foreground rounded-md border border-dashed p-6 text-sm'>
        Loading post...
      </div>
    );
  }

  return (
    <PostForm
      editingPost={editingPost}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
