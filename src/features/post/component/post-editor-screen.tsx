'use client';

import { useEffect } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useTranslate } from '@/hooks/use-translate';
import PostViewPage from './post-view-page';

type PostEditorScreenProps = {
  mode: 'create' | 'edit';
  postId: string;
  initialPost?: any | null;
  initialPageId?: number;
  initialSectionId?: number;
};

export default function PostEditorScreen({
  mode,
  postId,
  initialPost,
  initialPageId,
  initialSectionId
}: PostEditorScreenProps) {
  const { t } = useTranslate();

  const title = mode === 'edit' ? t('post.editTitle') : t('post.createTitle');
  const description =
    mode === 'edit' ? t('post.editDescription') : t('post.createDescription');

  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div className='flex-1 space-y-4'>
      {/* Keep create/edit page headings in one shared client wrapper. */}
      <Heading title={title} description={description} />
      <Separator />
      <PostViewPage
        postId={postId}
        initialPost={initialPost}
        initialPageId={initialPageId}
        initialSectionId={initialSectionId}
      />
    </div>
  );
}
