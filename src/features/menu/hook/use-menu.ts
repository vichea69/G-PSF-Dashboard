'use client';

import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
  type UseQueryResult
} from '@tanstack/react-query';
import { toLocalizedLabel, type MenuGroup } from '@/features/menu/types';
import { normalizeMenuTreeResponse } from '@/features/menu/utils/menu-normalizer';
import {
  createMenu as createMenuAction,
  createMenuItem as createMenuItemAction,
  deleteMenu as deleteMenuAction,
  deleteMenuItem as deleteMenuItemAction,
  getMenuTreeBySlug as getMenuTreeBySlugAction,
  updateMenuItem as updateMenuItemAction
} from '@/server/action/menu/menu';
import type { MenuItem } from '@/features/menu/types';

const MENU_TREE_QUERY_KEY = 'menu-tree';

const extractErrorMessage = (error: unknown, fallback: string) => {
  const detail = (error as any)?.response?.data;
  return (
    detail?.message ||
    detail?.error ||
    (typeof detail === 'string' ? detail : undefined) ||
    (error as Error)?.message ||
    fallback
  );
};

export type CreateMenuRequest = {
  name: string;
};

export type CreateMenuItemRequest = {
  label: {
    en: string;
    km: string;
  };
  url: string;
  orderIndex: number;
  parentId: string | number | null;
};

type UpdateMenuItemRequest = {
  menuId: string;
  itemId: string;
  payload: {
    label?: {
      en: string;
      km: string;
    };
    url?: string;
    orderIndex?: number;
    parentId?: string | number | null;
  };
};

export const fetchMenuTreeBySlug = async (slug: string): Promise<MenuGroup> => {
  const response = await getMenuTreeBySlugAction(slug);
  return normalizeMenuTreeResponse(response, slug);
};

export const useMenuTrees = (slugs: string[]) => {
  const safeSlugs = slugs.filter((slug) => slug.trim().length > 0);
  const queryResults = useQueries({
    queries: safeSlugs.map((slug) => ({
      queryKey: [MENU_TREE_QUERY_KEY, slug],
      queryFn: () => fetchMenuTreeBySlug(slug),
      retry: false
    }))
  }) as UseQueryResult<MenuGroup>[];

  const menus = queryResults
    .map((result) => result.data)
    .filter((menu): menu is MenuGroup => Boolean(menu));

  return {
    menus,
    isLoading: queryResults.some((result) => result.isLoading),
    isFetching: queryResults.some((result) => result.isFetching),
    isError:
      queryResults.length > 0 &&
      queryResults.every((result) => result.isError) &&
      menus.length === 0,
    errors: queryResults
      .map((result) => result.error)
      .filter((error): error is Error => Boolean(error))
  };
};

export const useMenuTree = (slug: string) => {
  const result = useQuery<MenuGroup>({
    queryKey: [MENU_TREE_QUERY_KEY, slug],
    queryFn: () => fetchMenuTreeBySlug(slug),
    retry: false,
    enabled: slug.trim().length > 0
  });

  return {
    menu: result.data ?? null,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    isError: result.isError,
    error: result.error
  };
};

export const useCreateMenu = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateMenuRequest) => {
      try {
        return await createMenuAction(payload);
      } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, 'Failed to create menu'));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MENU_TREE_QUERY_KEY] });
    }
  });
};

export const useCreateMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      menuId,
      payload
    }: {
      menuId: string;
      payload: CreateMenuItemRequest;
    }) => {
      try {
        return await createMenuItemAction(menuId, payload);
      } catch (error: unknown) {
        throw new Error(
          extractErrorMessage(error, 'Failed to create menu item')
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MENU_TREE_QUERY_KEY] });
    }
  });
};

export const useUpdateMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    onMutate: async ({ itemId, payload }) => {
      await queryClient.cancelQueries({ queryKey: [MENU_TREE_QUERY_KEY] });

      const previousEntries = queryClient.getQueriesData<MenuGroup>({
        queryKey: [MENU_TREE_QUERY_KEY]
      });

      queryClient.setQueriesData<MenuGroup>(
        { queryKey: [MENU_TREE_QUERY_KEY] },
        (current) => {
          if (!current) return current;

          const hasTarget = current.items.some((item) => item.id === itemId);
          if (!hasTarget) return current;

          return {
            ...current,
            items: current.items.map((item) => {
              if (item.id !== itemId) return item;
              return {
                ...item,
                ...(payload.label ? { label: payload.label } : {}),
                ...(typeof payload.url === 'string'
                  ? { url: payload.url }
                  : {}),
                ...(typeof payload.orderIndex === 'number'
                  ? { order: payload.orderIndex }
                  : {}),
                ...(Object.prototype.hasOwnProperty.call(payload, 'parentId')
                  ? {
                      parentId:
                        payload.parentId === null ||
                        payload.parentId === undefined
                          ? undefined
                          : String(payload.parentId)
                    }
                  : {})
              };
            })
          };
        }
      );

      return { previousEntries };
    },
    mutationFn: async ({ menuId, itemId, payload }: UpdateMenuItemRequest) => {
      try {
        return await updateMenuItemAction(menuId, itemId, payload);
      } catch (error: unknown) {
        throw new Error(
          extractErrorMessage(error, 'Failed to update menu item')
        );
      }
    },
    onError: (_error, _variables, context) => {
      if (!context?.previousEntries) return;
      context.previousEntries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [MENU_TREE_QUERY_KEY] });
      queryClient.refetchQueries({
        queryKey: [MENU_TREE_QUERY_KEY],
        type: 'active'
      });
    }
  });
};

export const useDeleteMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      menuId,
      itemId
    }: {
      menuId: string;
      itemId: string;
    }) => {
      try {
        return await deleteMenuItemAction(menuId, itemId);
      } catch (error: unknown) {
        throw new Error(
          extractErrorMessage(error, 'Failed to delete menu item')
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MENU_TREE_QUERY_KEY] });
    }
  });
};

export const useDeleteMenu = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ menuId }: { menuId: string }) => {
      try {
        return await deleteMenuAction(menuId);
      } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, 'Failed to delete menu'));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MENU_TREE_QUERY_KEY] });
    }
  });
};

export const toNullableMenuId = (value?: string) => {
  if (!value || value.trim().length === 0) return null;
  const parsed = Number(value);
  if (Number.isFinite(parsed)) return parsed;
  return value;
};

export const toCreateMenuItemPayload = (
  payload: Pick<MenuItem, 'label' | 'url' | 'parentId'>,
  orderIndex: number
): CreateMenuItemRequest => {
  const localizedLabel = toLocalizedLabel(payload.label);
  const fallbackLabel = (localizedLabel.en || localizedLabel.km || '').trim();
  const labelEn = localizedLabel.en.trim();
  const labelKm = localizedLabel.km.trim();

  return {
    label: {
      en: labelEn || labelKm || fallbackLabel,
      km: labelKm || labelEn || fallbackLabel
    },
    url: payload.url.trim(),
    orderIndex,
    parentId: toNullableMenuId(payload.parentId)
  };
};
