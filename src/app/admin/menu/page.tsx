'use client';

import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { CreateMenuPayload } from '@/features/menu/components/CreateMenuDialog';
import { MenuTableList } from '@/features/menu/components/menu-table';
import { useCreateMenu } from '@/features/menu/hook/use-menu';
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

export default function MenuListPage() {
  const qc = useQueryClient();
  const { data: menusData, isLoading, isError } = useMenu();
  const createMenuMutation = useCreateMenu();

  const menus: MenuGroup[] = useMemo(() => {
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
      toast.error('Menu slug is required');
      return;
    }

    createMenuMutation.mutate(
      { name: nextSlug },
      {
        onSuccess: () => {
          toast.success('Menu created');
          qc.invalidateQueries({ queryKey: ['menus'] });
        },
        onError: (error) => {
          toast.error((error as Error)?.message ?? 'Failed to create menu');
        }
      }
    );
  };

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Menus'
            description='Create and manage navigation menus'
          />
        </div>
        <Separator />

        {isLoading ? (
          <div className='text-muted-foreground rounded-md border border-dashed p-4 text-sm'>
            Loading menus...
          </div>
        ) : null}

        {isError ? (
          <div className='text-destructive rounded-md border border-dashed p-4 text-sm'>
            Failed to load menus.
          </div>
        ) : null}

        {!isLoading && !isError ? (
          <MenuTableList data={menus} onCreate={handleCreateMenu} />
        ) : null}
      </div>
    </PageContainer>
  );
}
