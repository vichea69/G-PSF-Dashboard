'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertModal } from '@/components/modal/alert-modal';
import { MenusList } from '@/features/menu/components/MenusList';
import { MenuItemsPanel } from '@/features/menu/components/MenuItemsPanel';
import { EditMenuItemDialog } from '@/features/menu/components/EditMenuItemDialog';
import {
  CreateMenuDialog,
  CreateMenuPayload
} from '@/features/menu/components/CreateMenuDialog';
import {
  CreateMenuItemDialog,
  CreateMenuItemPayload
} from '@/features/menu/components/CreateMenuItemDialog';
import {
  RenameMenuDialog,
  RenameMenuPayload
} from '@/features/menu/components/RenameMenuDialog';
import type { MenuItem, MenuGroup } from '@/features/menu/types';
import { Trash2 } from 'lucide-react';
import {
  useMenuTree,
  useMenus,
  useCreateMenu,
  useCreateMenuItem,
  useDeleteMenu,
  useDeleteMenuItem,
  useUpdateMenu,
  useUpdateMenuItem,
  menuQueryKeys,
  toNullableMenuId,
  toCreateMenuItemPayload
} from '@/features/menu/hook/use-menu';
import { useTranslate } from '@/hooks/use-translate';
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

type DeleteTarget = { type: 'menu' } | { type: 'item'; itemId: string } | null;

interface MenuDetailClientProps {
  slug: string;
  initialMenu?: MenuGroup | null;
  initialMenus?: MenuGroup[];
}

export default function MenuDetailClient({
  slug,
  initialMenu,
  initialMenus
}: MenuDetailClientProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { t } = useTranslate();
  const { menu, isLoading, isError, isFetching } = useMenuTree(
    slug,
    initialMenu
  );
  const { menus: allMenus } = useMenus(initialMenus);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const createMenuMutation = useCreateMenu();
  const createMenuItemMutation = useCreateMenuItem();
  const updateMenuMutation = useUpdateMenu();
  const updateMenuItemMutation = useUpdateMenuItem();
  const deleteMenuItemMutation = useDeleteMenuItem();
  const deleteMenuMutation = useDeleteMenu();

  const editingItem = useMemo(
    () => menu?.items.find((item) => item.id === editingItemId) ?? null,
    [menu?.items, editingItemId]
  );

  useEffect(() => {
    document.title = menu?.name || t('menu.title');
  }, [menu?.name, t]);

  const handleCreateMenu = async (payload: CreateMenuPayload) => {
    const nextSlug = normalizeSlug(payload.name);
    if (!nextSlug) {
      toast.error(t('menu.toast.slugRequired'));
      throw new Error(t('menu.toast.slugRequired'));
    }

    try {
      await createMenuMutation.mutateAsync({ name: nextSlug });
      toast.success(t('menu.toast.created'));
      router.push(`/admin/menu/${nextSlug}`);
    } catch (error) {
      toast.error(
        readMenuErrorMessage(error, t('menu.toast.createFailed'), [
          'Failed to create menu'
        ])
      );
      throw error;
    }
  };

  const handleCreateMenuItem = async (payload: CreateMenuItemPayload) => {
    if (!menu) throw new Error('Menu not found');

    const targetParent = payload.parentId ?? undefined;
    const siblingCount = menu.items.filter(
      (item) => (item.parentId ?? undefined) === targetParent
    ).length;

    try {
      await createMenuItemMutation.mutateAsync({
        menuId: menu.id,
        payload: toCreateMenuItemPayload(
          {
            label: payload.label,
            url: payload.url,
            parentId: payload.parentId ?? undefined
          },
          siblingCount
        )
      });
      toast.success(t('menu.toast.itemCreated'));
    } catch (error) {
      toast.error(
        readMenuErrorMessage(error, t('menu.toast.itemCreateFailed'), [
          'Failed to create menu item'
        ])
      );
      throw error;
    }
  };

  const requestDeleteMenuItem = (itemId: string) => {
    setDeleteTarget({ type: 'item', itemId });
  };

  const requestDeleteMenu = () => {
    setDeleteTarget({ type: 'menu' });
  };

  const requestEditMenuItem = (itemId: string) => {
    setEditingItemId(itemId);
  };

  const handleRenameMenu = async (payload: RenameMenuPayload) => {
    if (!menu) return;

    try {
      await updateMenuMutation.mutateAsync({
        menuId: menu.id,
        payload: {
          name: payload.name.trim()
        }
      });

      toast.success(t('menu.toast.nameUpdated'));
    } catch (error) {
      toast.error(
        readMenuErrorMessage(error, t('menu.toast.nameUpdateFailed'), [
          'Failed to update menu'
        ])
      );
      throw error;
    }
  };

  const handleSubmitEditMenuItem = (payload: {
    itemId: string;
    label: { en: string; km: string };
    url: string;
    parentId: string | null;
  }) => {
    if (!menu) return;

    const currentItem = menu.items.find((item) => item.id === payload.itemId);
    if (!currentItem) return;

    updateMenuItemMutation.mutate(
      {
        menuId: menu.id,
        itemId: payload.itemId,
        payload: {
          label: {
            en: payload.label.en.trim() || payload.label.km.trim(),
            km: payload.label.km.trim() || payload.label.en.trim()
          },
          url: payload.url.trim(),
          orderIndex: currentItem.order,
          ...(toNullableMenuId(currentItem.parentId) !==
          toNullableMenuId(payload.parentId ?? undefined)
            ? { parentId: toNullableMenuId(payload.parentId ?? undefined) }
            : {})
        }
      },
      {
        onSuccess: () => {
          toast.success(t('menu.toast.itemUpdated'));
          setEditingItemId(null);
        },
        onError: (error) => {
          toast.error(
            readMenuErrorMessage(error, t('menu.toast.itemUpdateFailed'), [
              'Failed to update menu item'
            ])
          );
        }
      }
    );
  };

  const handleConfirmDelete = () => {
    if (!menu || !deleteTarget) return;

    if (deleteTarget.type === 'item') {
      deleteMenuItemMutation.mutate(
        { menuId: menu.id, itemId: deleteTarget.itemId },
        {
          onSuccess: () => {
            toast.success(t('menu.toast.itemDeleted'));
            setDeleteTarget(null);
          },
          onError: (error) => {
            toast.error(
              readMenuErrorMessage(error, t('menu.toast.itemDeleteFailed'), [
                'Failed to delete menu item'
              ])
            );
          }
        }
      );
      return;
    }

    deleteMenuMutation.mutate(
      { menuId: menu.id },
      {
        onSuccess: () => {
          toast.success(t('menu.toast.deleted'));
          setDeleteTarget(null);
          router.push('/admin/menu');
        },
        onError: (error) => {
          toast.error(
            readMenuErrorMessage(error, t('menu.toast.deleteFailed'), [
              'Failed to delete menu'
            ])
          );
        }
      }
    );
  };

  const handleReorderItems = async (nextItems: MenuItem[]) => {
    if (!menu) return;

    const previousById = new Map(menu.items.map((item) => [item.id, item]));

    const changedItems = nextItems.filter((item) => {
      const previous = previousById.get(item.id);
      if (!previous) return false;
      return (
        previous.order !== item.order ||
        (previous.parentId ?? null) !== (item.parentId ?? null)
      );
    });

    if (changedItems.length === 0) return;

    const results = await Promise.allSettled(
      changedItems.map((item) => {
        const previous = previousById.get(item.id);
        const payload: {
          orderIndex: number;
          parentId?: string | number | null;
        } = {
          orderIndex: item.order
        };

        if (
          previous &&
          toNullableMenuId(previous.parentId) !==
            toNullableMenuId(item.parentId)
        ) {
          payload.parentId = toNullableMenuId(item.parentId);
        }

        return updateMenuItemMutation.mutateAsync({
          menuId: menu.id,
          itemId: item.id,
          payload,
          options: {
            skipRefetch: true
          }
        });
      })
    );

    await queryClient.refetchQueries({
      queryKey: menuQueryKeys.tree(slug),
      type: 'active'
    });

    const rejected = results.find((result) => result.status === 'rejected');

    if (rejected?.status === 'rejected') {
      toast.error(
        readMenuErrorMessage(rejected.reason, t('menu.toast.reorderFailed'), [
          'Failed to update menu item'
        ])
      );
      return;
    }

    toast.success(t('menu.toast.orderUpdated'));
  };

  return (
    <PageContainer>
      <AlertModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        loading={
          deleteMenuMutation.isPending || deleteMenuItemMutation.isPending
        }
      />
      {menu ? (
        <EditMenuItemDialog
          open={editingItemId !== null}
          onOpenChange={(open) => {
            if (!open) setEditingItemId(null);
          }}
          selectedMenu={menu}
          item={editingItem}
          loading={updateMenuItemMutation.isPending}
          onSubmit={handleSubmitEditMenuItem}
        />
      ) : null}

      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title={t('menu.title')}
            description={t('menu.description')}
          />
          <div className='flex gap-2'>
            {menu ? (
              <RenameMenuDialog
                currentName={menu.name}
                loading={updateMenuMutation.isPending}
                onSubmit={handleRenameMenu}
              />
            ) : null}
            {menu && (
              <CreateMenuItemDialog
                selectedMenu={menu}
                onCreate={handleCreateMenuItem}
                loading={createMenuItemMutation.isPending}
              />
            )}
            {menu ? (
              <Button
                variant='destructive'
                onClick={requestDeleteMenu}
                disabled={deleteMenuMutation.isPending}
              >
                <Trash2 className='mr-2 h-4 w-4' />
                {t('menu.panel.delete')}
              </Button>
            ) : null}
          </div>
        </div>
        <Separator />

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-4'>
          {/* Sidebar */}
          <div className='lg:col-span-1'>
            <Card>
              <CardContent className='p-3'>
                <div className='mb-2 flex items-center justify-between'>
                  <h3 className='text-muted-foreground px-1 text-xs font-semibold tracking-wider uppercase'>
                    {t('menu.panel.sidebarTitle')}
                  </h3>
                  <CreateMenuDialog
                    onCreate={handleCreateMenu}
                    loading={createMenuMutation.isPending}
                  />
                </div>
                <Separator className='mb-2' />
                {allMenus.length > 0 ? (
                  <ScrollArea className='max-h-[60vh]'>
                    <MenusList menus={allMenus} activeSlug={slug} />
                  </ScrollArea>
                ) : (
                  <p className='text-muted-foreground px-1 py-4 text-center text-xs'>
                    {t('menu.panel.noMenusYet')}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Menu Items */}
          <div className='lg:col-span-3'>
            {isLoading ? (
              <Card>
                <CardContent className='p-4'>
                  <div className='space-y-3'>
                    <Skeleton className='h-5 w-32' />
                    <Separator />
                    {[1, 2, 3].map((i) => (
                      <div key={i} className='flex items-center gap-3'>
                        <Skeleton className='h-4 w-4' />
                        <Skeleton className='h-4 flex-1' />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {isError ? (
              <Card>
                <CardContent className='p-4'>
                  <div className='text-destructive text-sm'>
                    {t('menu.toast.detailLoadFailed')}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {!isLoading && !isError && menu ? (
              <MenuItemsPanel
                selectedMenu={menu}
                onEdit={requestEditMenuItem}
                onDelete={requestDeleteMenuItem}
                onReorder={handleReorderItems}
              />
            ) : null}

            {isFetching && !isLoading ? (
              <p className='text-muted-foreground mt-2 text-xs'>
                {t('menu.panel.refreshing')}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
