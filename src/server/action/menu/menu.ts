'use server';
import 'server-only';

import { api } from '@/lib/api';
import { getAuthHeaders } from '@/server/action/userAuth/user';

type MenuLabelPayload = {
  en: string;
  km: string;
};

type CreateMenuPayload = {
  name: string;
};

type CreateMenuItemPayload = {
  label: MenuLabelPayload;
  url: string;
  orderIndex: number;
  parentId?: string | number | null;
};

type UpdateMenuItemPayload = {
  label?: MenuLabelPayload;
  url?: string;
  orderIndex?: number;
  parentId?: string | number | null;
};

function getApiErrorMessage(error: unknown, fallback: string) {
  const detail = (error as any)?.response?.data;
  return (
    detail?.message ||
    detail?.error ||
    (typeof detail === 'string' ? detail : undefined) ||
    (error as Error)?.message ||
    fallback
  );
}

export async function getMenuTreeBySlug(slug: string) {
  const headers = await getAuthHeaders();

  try {
    const res = await api.get(`/menus/slug/${encodeURIComponent(slug)}/tree`, {
      headers,
      withCredentials: true
    });
    return res.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, 'Failed to load menu tree'));
  }
}

export async function createMenu(payload: CreateMenuPayload) {
  const headers = await getAuthHeaders();

  try {
    const res = await api.post('/menus', payload, {
      headers,
      withCredentials: true
    });
    return res.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, 'Failed to create menu'));
  }
}

export async function createMenuItem(
  menuId: string | number,
  payload: CreateMenuItemPayload
) {
  const headers = await getAuthHeaders();

  try {
    const res = await api.post(`/menus/${menuId}/items`, payload, {
      headers,
      withCredentials: true
    });
    return res.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, 'Failed to create menu item'));
  }
}

export async function getMenuItemsTree(menuId: string | number) {
  const headers = await getAuthHeaders();

  try {
    const res = await api.get(`/menus/${menuId}/items`, {
      headers,
      withCredentials: true
    });
    return res.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, 'Failed to load menu items'));
  }
}

export async function updateMenuItem(
  menuId: string | number,
  itemId: string | number,
  payload: UpdateMenuItemPayload
) {
  const headers = await getAuthHeaders();

  try {
    const res = await api.put(`/menus/${menuId}/items/${itemId}`, payload, {
      headers,
      withCredentials: true
    });
    return res.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, 'Failed to update menu item'));
  }
}

export async function deleteMenuItem(
  menuId: string | number,
  itemId: string | number
) {
  const headers = await getAuthHeaders();

  try {
    const res = await api.delete(`/menus/${menuId}/items/${itemId}`, {
      headers,
      withCredentials: true
    });
    return res.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, 'Failed to delete menu item'));
  }
}

export async function deleteMenu(menuId: string | number) {
  const headers = await getAuthHeaders();

  try {
    const res = await api.delete(`/menus/${menuId}`, {
      headers,
      withCredentials: true
    });
    return res.data;
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, 'Failed to delete menu'));
  }
}
