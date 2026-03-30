'use client';

import { useEffect } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { CreateMenuPayload } from '@/features/menu/components/CreateMenuDialog';
import { MenuTableList } from '@/features/menu/components/menu-table';
import { useCreateMenu, useMenus } from '@/features/menu/hook/use-menu';
import { useTranslate } from '@/hooks/use-translate';
import type { MenuGroup } from '@/features/menu/types';
import { toast } from 'sonner';

const normalizeSlug = (value: string) => {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
};

const readMenuErrorMessage = (
  error: unknown,
  fallback: string,
  knownFallbacks: string[]
) => {
  const message = error instanceof Error ? error.message?.trim() : '';
  if (!message || knownFallbacks.includes(message)) {
    return fallback;
  }
  return message;
};

interface MenuPageClientProps {
  initialMenus?: MenuGroup[];
}

export default function MenuPageClient({ initialMenus }: MenuPageClientProps) {
  const { t } = useTranslate();
  const { menus, isLoading, isError } = useMenus(initialMenus);
  const createMenuMutation = useCreateMenu();

  useEffect(() => {
    document.title = t('menu.title');
  }, [t]);

  const handleCreateMenu = async (payload: CreateMenuPayload) => {
    const nextSlug = normalizeSlug(payload.name);
    if (!nextSlug) {
      toast.error(t('menu.toast.slugRequired'));
      throw new Error(t('menu.toast.slugRequired'));
    }

    try {
      await createMenuMutation.mutateAsync({ name: nextSlug });
      toast.success(t('menu.toast.created'));
    } catch (error) {
      toast.error(
        readMenuErrorMessage(error, t('menu.toast.createFailed'), [
          'Failed to create menu'
        ])
      );
      throw error;
    }
  };

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title={t('menu.title')}
            description={t('menu.description')}
          />
        </div>
        <Separator />

        {isLoading ? (
          <div className='text-muted-foreground rounded-md border border-dashed p-4 text-sm'>
            {t('menu.table.loading')}
          </div>
        ) : null}

        {isError ? (
          <div className='text-destructive rounded-md border border-dashed p-4 text-sm'>
            {t('menu.table.loadFailed')}
          </div>
        ) : null}

        {!isLoading && !isError ? (
          <MenuTableList
            data={menus}
            onCreate={handleCreateMenu}
            createLoading={createMenuMutation.isPending}
          />
        ) : null}
      </div>
    </PageContainer>
  );
}
