'use client';

import { useMemo, useState } from 'react';
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
import type { MenuItem, MenuGroup } from '@/features/menu/types';
import { Trash2 } from 'lucide-react';
import {
  useMenuTree,
  useCreateMenu,
  useCreateMenuItem,
  useDeleteMenu,
  useDeleteMenuItem,
  useUpdateMenuItem,
  toNullableMenuId,
  toCreateMenuItemPayload
} from '@/features/menu/hook/use-menu';
import { useMenu } from '@/hooks/use-menu';
import { normalizeMenuTreeResponse } from '@/features/menu/utils/menu-normalizer';
import { toast } from 'sonner';

const normalizeSlug = (value: string) => {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
};

type DeleteTarget = { type: 'menu' } | { type: 'item'; itemId: string } | null;

interface MenuDetailClientProps {
  slug: string;
}

export default function MenuDetailClient({ slug }: MenuDetailClientProps) {
  const router = useRouter();
  const { menu, isLoading, isError, isFetching } = useMenuTree(slug);
  const { data: allMenusData } = useMenu();
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const createMenuMutation = useCreateMenu();
  const createMenuItemMutation = useCreateMenuItem();
  const updateMenuItemMutation = useUpdateMenuItem();
  const deleteMenuItemMutation = useDeleteMenuItem();
  const deleteMenuMutation = useDeleteMenu();

  const allMenus: MenuGroup[] = useMemo(() => {
    const raw = allMenusData?.data ?? allMenusData;
    if (Array.isArray(raw)) {
      return raw.map((item: unknown, index: number) =>
        normalizeMenuTreeResponse(item, `menu-${index}`)
      );
    }
    return [];
  }, [allMenusData]);

  const editingItem = useMemo(
    () => menu?.items.find((item) => item.id === editingItemId) ?? null,
    [menu?.items, editingItemId]
  );

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
          router.push(`/admin/menu/${nextSlug}`);
        },
        onError: (error) => {
          toast.error((error as Error)?.message ?? 'Failed to create menu');
        }
      }
    );
  };

  const handleCreateMenuItem = (payload: CreateMenuItemPayload) => {
    if (!menu) return;

    const targetParent = payload.parentId ?? undefined;
    const siblingCount = menu.items.filter(
      (item) => (item.parentId ?? undefined) === targetParent
    ).length;

    createMenuItemMutation.mutate(
      {
        menuId: menu.id,
        payload: toCreateMenuItemPayload(
          {
            label: payload.label,
            url: payload.url,
            parentId: payload.parentId ?? undefined
          },
          siblingCount
        )
      },
      {
        onSuccess: () => {
          toast.success('Menu item created');
        },
        onError: (error) => {
          toast.error(
            (error as Error)?.message ?? 'Failed to create menu item'
          );
        }
      }
    );
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
          toast.success('Menu item updated');
          setEditingItemId(null);
        },
        onError: (error) => {
          toast.error(
            (error as Error)?.message ?? 'Failed to update menu item'
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
            toast.success('Menu item deleted');
            setDeleteTarget(null);
          },
          onError: (error) => {
            toast.error(
              (error as Error)?.message ?? 'Failed to delete menu item'
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
          toast.success('Menu deleted');
          setDeleteTarget(null);
          router.push('/admin/menu');
        },
        onError: (error) => {
          toast.error((error as Error)?.message ?? 'Failed to delete menu');
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

    try {
      await Promise.all(
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
            payload
          });
        })
      );
      toast.success('Menu order updated');
    } catch (error) {
      toast.error((error as Error)?.message ?? 'Failed to reorder items');
    }
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
            title='Menus'
            description='Create and manage navigation menus'
          />
          <div className='flex gap-2'>
            {menu && (
              <CreateMenuItemDialog
                selectedMenu={menu}
                onCreate={handleCreateMenuItem}
              />
            )}
            {menu ? (
              <Button
                variant='ghost'
                size='sm'
                onClick={requestDeleteMenu}
                disabled={deleteMenuMutation.isPending}
                className='text-destructive hover:text-destructive hover:bg-destructive/10'
              >
                <Trash2 className='mr-1.5 h-4 w-4' />
                Delete
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
                    Menus
                  </h3>
                  <CreateMenuDialog onCreate={handleCreateMenu} />
                </div>
                <Separator className='mb-2' />
                {allMenus.length > 0 ? (
                  <ScrollArea className='max-h-[60vh]'>
                    <MenusList menus={allMenus} activeSlug={slug} />
                  </ScrollArea>
                ) : (
                  <p className='text-muted-foreground px-1 py-4 text-center text-xs'>
                    No menus yet
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
                    Failed to load menu. Please check the slug and try again.
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {!isLoading && !isError && menu ? (
              <MenuItemsPanel
                selectedMenu={menu}
                onEdit={requestEditMenuItem}
                onToggleVisibility={undefined}
                onDelete={requestDeleteMenuItem}
                onReorder={handleReorderItems}
              />
            ) : null}

            {isFetching && !isLoading ? (
              <p className='text-muted-foreground mt-2 text-xs'>
                Refreshing...
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
