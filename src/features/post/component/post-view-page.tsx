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

        // title (jsonb) — allow Khmer-only or English-only input
        const titleEn = (formData.titleEn || '').trim();
        const titleKm = (formData.titleKm || '').trim();
        if (!titleEn && !titleKm) {
          toast.error('Please enter title in English or Khmer');
          return;
        }
        const titleJson = {
          en: titleEn,
          km: titleKm || undefined
        };

        // description (jsonb, optional)
        const hasDescription =
          (formData.descriptionEn?.trim() ?? '') ||
          (formData.descriptionKm?.trim() ?? '');
        const descriptionJson = hasDescription
          ? {
              en: formData.descriptionEn?.trim() || undefined,
              km: formData.descriptionKm?.trim() || undefined
            }
          : undefined;
        const normalizeContentEntry = (value: unknown) => {
          if (!value) return { type: 'doc', content: [] };
          if (typeof value === 'string') {
            const trimmed = value.trim();
            return trimmed ? value : { type: 'doc', content: [] };
          }
          return value;
        };
        const rawContent = formData.content ?? { en: '' };
        const contentValue = {
          en: normalizeContentEntry(rawContent.en ?? rawContent.km),
          km: rawContent.km ? normalizeContentEntry(rawContent.km) : undefined
        };
        const numOrNull = (val: unknown) => {
          if (val === null || val === undefined) return null;
          if (typeof val === 'string' && val.trim() === '') return null;
          const n = Number(val);
          return Number.isFinite(n) ? n : null;
        };
        const categoryId = numOrNull(formData.categoryId);
        const sectionId = numOrNull(formData.sectionId);
        const pageId = numOrNull(formData.pageId);
        const publishDate = formData.publishDate?.trim() || '';
        const isFeatured = Boolean(formData.isFeatured);
        const coverImage = formData.coverImage?.trim() || '';
        const normalizeDocumentEntry = (entry?: {
          url?: string;
          thumbnailUrl?: string;
        }) => {
          const url = entry?.url?.trim() || '';
          const thumbnailUrl = entry?.thumbnailUrl?.trim() || '';
          if (!url && !thumbnailUrl) return undefined;
          return {
            ...(url ? { url } : {}),
            ...(thumbnailUrl ? { thumbnailUrl } : {})
          };
        };
        const documents = {
          en: normalizeDocumentEntry(formData.documents?.en),
          km: normalizeDocumentEntry(formData.documents?.km)
        };
        const hasDocuments = Boolean(documents.en || documents.km);
        const document = documents.en?.url || formData.document?.trim() || '';
        const link = formData.link?.trim() || '';
        const payload = {
          title: titleJson,
          description: descriptionJson,
          content: contentValue,
          // slug intentionally omitted; backend derives it if needed
          status: formData.status,
          isFeatured,
          publishedAt:
            formData.status === 'published' && publishDate
              ? publishDate
              : undefined,
          categoryId: categoryId ?? undefined,
          sectionId: sectionId ?? undefined,
          pageId: pageId ?? undefined,
          coverImage: coverImage || undefined,
          document: document || undefined,
          documents: hasDocuments
            ? {
                ...(documents.en ? { en: documents.en } : {}),
                ...(documents.km ? { km: documents.km } : {})
              }
            : undefined,
          link: link || undefined,
          existingImageIds: formData.existingImageIds?.length
            ? formData.existingImageIds
            : undefined,
          removedImageIds: formData.removedImageIds?.length
            ? formData.removedImageIds
            : undefined
        };

        const fd = new FormData();
        fd.append('title', JSON.stringify(payload.title));
        if (payload.description) {
          fd.append('description', JSON.stringify(payload.description));
        }
        fd.append('content', JSON.stringify(payload.content));
        fd.append('status', payload.status);
        fd.append('isFeatured', String(payload.isFeatured));
        if (payload.publishedAt) {
          fd.append('publishedAt', payload.publishedAt);
        }
        if (payload.categoryId !== undefined) {
          fd.append('categoryId', String(payload.categoryId));
        }
        if (payload.sectionId !== undefined) {
          fd.append('sectionId', String(payload.sectionId));
        }
        if (payload.pageId !== undefined) {
          fd.append('pageId', String(payload.pageId));
        }
        if (payload.coverImage) {
          fd.append('coverImage', payload.coverImage);
        }
        if (payload.document) {
          fd.append('document', payload.document);
        }
        if (payload.documents) {
          fd.append('documents', JSON.stringify(payload.documents));
        }
        if (payload.link) {
          fd.append('link', payload.link);
        }
        if (payload.existingImageIds) {
          fd.append(
            'existingImageIds',
            JSON.stringify(payload.existingImageIds)
          );
        }
        if (payload.removedImageIds) {
          fd.append('removedImageIds', JSON.stringify(payload.removedImageIds));
        }
        if (formData.newImages?.length) {
          formData.newImages.forEach((file) => {
            fd.append('images', file);
          });
        }
        const body = fd;
        // eslint-disable-next-line no-console
        console.log('[PostView] CREATE', 'server action');
        if (isEditing) {
          await updatePost(_postId, body);
        } else {
          await createPost(body);
        }
        toast.success(isEditing ? 'Post updated' : 'Post created');
        qc.invalidateQueries({ queryKey: ['posts'] });
        router.replace('/admin/post');
      } catch (e: any) {
        const resp = e?.response?.data;
        const message =
          resp?.message ||
          resp?.error ||
          (typeof resp === 'string' ? resp : null) ||
          e?.message ||
          'Save failed';
        // eslint-disable-next-line no-console
        console.error('[PostView] SAVE error', {
          status: e?.response?.status,
          data: resp,
          message
        });
        // extra debug for backend response structure
        // eslint-disable-next-line no-console
        console.error('[PostView] SAVE error raw', e);
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
