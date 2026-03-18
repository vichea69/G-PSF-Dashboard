'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { IconPlus } from '@tabler/icons-react';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useTranslate } from '@/hooks/use-translate';
import { cn } from '@/lib/utils';
import PostsListPage from './post-list';

type PostsListScreenProps = {
  canCreatePost: boolean;
};

export default function PostsListScreen({
  canCreatePost
}: PostsListScreenProps) {
  const { t } = useTranslate();

  useEffect(() => {
    document.title = t('post.title');
  }, [t]);

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      {/* Keep the list page heading in one client component so it follows the selected language. */}
      <div className='flex items-start justify-between'>
        <Heading title={t('post.title')} description={t('post.description')} />
        {canCreatePost ? (
          <Link
            href='/admin/post/new'
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <IconPlus className='mr-2 h-4 w-4' /> {t('post.addNew')}
          </Link>
        ) : null}
      </div>
      <Separator />
      <PostsListPage />
    </div>
  );
}
