'use client';

import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
  type UseQueryResult
} from '@tanstack/react-query';
import { toLocalizedLabel, type MenuGroup } from '@/features/menu/types';
import {
  normalizeMenusResponse,
  normalizeMenuTreeResponse
} from '@/features/menu/utils/menu-normalizer';
import {
  createMenu as createMenuAction,
  createMenuItem as createMenuItemAction,
  deleteMenu as deleteMenuAction,
  deleteMenuItem as deleteMenuItemAction,
  getMenusTree as getMenusTreeAction,
  getMenuTreeBySlug as getMenuTreeBySlugAction,
  updateMenu as updateMenuAction,
  updateMenuItem as updateMenuItemAction
} from '@/server/action/menu/menu';
import type { MenuItem } from '@/features/menu/types';

export const MENU_TREE_QUERY_KEY = 'menu-tree';
export const MENUS_QUERY_KEY = 'menus';
const MENU_STALE_TIME = 30_000;

export const menuQueryKeys = {
  menus: [MENUS_QUERY_KEY] as const,
  tree: (slug: string) => [MENU_TREE_QUERY_KEY, slug] as const,
  trees: [MENU_TREE_QUERY_KEY] as const
};

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

type UpdateMenuRequest = {
  menuId: string;
  payload: {
    name: string;
  };
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
  options?: {
    skipRefetch?: boolean;
  };
};

export const fetchMenuTreeBySlug = async (slug: string): Promise<MenuGroup> => {
  const response = await getMenuTreeBySlugAction(slug);
  return normalizeMenuTreeResponse(response, slug);
};

export const fetchMenus = async (): Promise<MenuGroup[]> => {
  const response = await getMenusTreeAction();
  return normalizeMenusResponse(response);
};

export const useMenus = (initialData?: MenuGroup[]) => {
  const result = useQuery<MenuGroup[]>({
    queryKey: menuQueryKeys.menus,
    queryFn: fetchMenus,
    retry: false,
    staleTime: MENU_STALE_TIME,
    ...(initialData ? { initialData } : {})
  });

  return {
    menus: result.data ?? [],
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    isError: result.isError,
    error: result.error
  };
};

export const useMenuTrees = (slugs: string[]) => {
  const safeSlugs = slugs.filter((slug) => slug.trim().length > 0);
  const queryResults = useQueries({
    queries: safeSlugs.map((slug) => ({
      queryKey: menuQueryKeys.tree(slug),
      queryFn: () => fetchMenuTreeBySlug(slug),
      retry: false,
      staleTime: MENU_STALE_TIME
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

export const useMenuTree = (slug: string, initialData?: MenuGroup | null) => {
  const result = useQuery<MenuGroup>({
    queryKey: menuQueryKeys.tree(slug),
    queryFn: () => fetchMenuTreeBySlug(slug),
    retry: false,
    enabled: slug.trim().length > 0,
    staleTime: MENU_STALE_TIME,
    ...(initialData ? { initialData } : {})
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
      queryClient.invalidateQueries({ queryKey: menuQueryKeys.trees });
      queryClient.invalidateQueries({ queryKey: menuQueryKeys.menus });
    }
  });
};

export const useUpdateMenu = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ menuId, payload }: UpdateMenuRequest) => {
      try {
        return await updateMenuAction(menuId, payload);
      } catch (error: unknown) {
        throw new Error(extractErrorMessage(error, 'Failed to update menu'));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuQueryKeys.trees });
      queryClient.invalidateQueries({ queryKey: menuQueryKeys.menus });
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
      queryClient.invalidateQueries({ queryKey: menuQueryKeys.trees });
      queryClient.invalidateQueries({ queryKey: menuQueryKeys.menus });
    }
  });
};

export const useUpdateMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    onMutate: async ({ itemId, payload }) => {
      await queryClient.cancelQueries({ queryKey: menuQueryKeys.trees });

      const previousEntries = queryClient.getQueriesData<MenuGroup>({
        queryKey: menuQueryKeys.trees
      });

      queryClient.setQueriesData<MenuGroup>(
        { queryKey: menuQueryKeys.trees },
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
    onSettled: (_data, _error, variables) => {
      if (variables.options?.skipRefetch) return;
      queryClient.invalidateQueries({ queryKey: menuQueryKeys.trees });
      queryClient.refetchQueries({
        queryKey: menuQueryKeys.trees,
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
      queryClient.invalidateQueries({ queryKey: menuQueryKeys.trees });
      queryClient.invalidateQueries({ queryKey: menuQueryKeys.menus });
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
      queryClient.invalidateQueries({ queryKey: menuQueryKeys.trees });
      queryClient.invalidateQueries({ queryKey: menuQueryKeys.menus });
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
