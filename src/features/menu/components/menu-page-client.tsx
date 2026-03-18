'use client';

import { useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { CreateMenuPayload } from '@/features/menu/components/CreateMenuDialog';
import { MenuTableList } from '@/features/menu/components/menu-table';
import { useCreateMenu } from '@/features/menu/hook/use-menu';
import { useTranslate } from '@/hooks/use-translate';
import { useMenu } from '@/hooks/use-menu';
import { normalizeMenuTreeResponse } from '@/features/menu/utils/menu-normalizer';
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

export default function MenuPageClient() {
  const qc = useQueryClient();
  const { t } = useTranslate();
  const { data: menusData, isLoading, isError } = useMenu();
  const createMenuMutation = useCreateMenu();

  useEffect(() => {
    document.title = t('menu.title');
  }, [t]);

  const menus: MenuGroup[] = useMemo(() => {
    // Normalize API responses into one stable table shape.
    const raw = menusData?.data ?? menusData;
    if (Array.isArray(raw)) {
      return raw.map((item: unknown, index: number) =>
        normalizeMenuTreeResponse(item, `menu-${index}`)
      );
    }
    return [];
  }, [menusData]);

  const handleCreateMenu = (payload: CreateMenuPayload) => {
    const nextSlug = normalizeSlug(payload.name);
    if (!nextSlug) {
      toast.error(t('menu.toast.slugRequired'));
      return;
    }

    createMenuMutation.mutate(
      { name: nextSlug },
      {
        onSuccess: () => {
          toast.success(t('menu.toast.created'));
          qc.invalidateQueries({ queryKey: ['menus'] });
        },
        onError: (error) => {
          toast.error(
            readMenuErrorMessage(error, t('menu.toast.createFailed'), [
              'Failed to create menu'
            ])
          );
        }
      }
    );
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
          <MenuTableList data={menus} onCreate={handleCreateMenu} />
        ) : null}
      </div>
    </PageContainer>
  );
}
