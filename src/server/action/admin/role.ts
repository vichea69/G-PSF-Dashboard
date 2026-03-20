'use server';
import { api } from '@/lib/api';
import { isSuperAdminRole } from '@/lib/super-admin';
import { getAuthHeaders } from '@/server/action/userAuth/user';
import type {
  CreateRole,
  UpdateRoleInfo,
  UpdateRolePermissions
} from './types';

// Read actions are server-side so the browser does not call protected role APIs directly.
export async function getRoles() {
  const headers = await getAuthHeaders();
  const res = await api.get('/roles', {
    headers,
    withCredentials: true
  });
  return res.data;
}

export async function getRoleById(id: string | number) {
  const headers = await getAuthHeaders();
  const res = await api.get(`/roles/${id}`, {
    headers,
    withCredentials: true
  });
  return res.data;
}

export async function getRolePermissions(id: string | number) {
  const headers = await getAuthHeaders();
  const res = await api.get(`/roles/${id}/permissions`, {
    headers,
    withCredentials: true
  });
  return res.data;
}

export async function getRoleResourceDefinitions() {
  const headers = await getAuthHeaders();
  const res = await api.get('/roles/resources/definition', {
    headers,
    withCredentials: true
  });
  return res.data;
}

function extractRoleRecord(payload: unknown) {
  const raw = payload as any;
  const data = raw?.data ?? raw ?? {};
  return (data?.role ?? data) as Record<string, unknown>;
}

async function assertRoleCanBeManaged(id: string | number) {
  const payload = await getRoleById(id);
  const role = extractRoleRecord(payload);

  if (isSuperAdminRole(role)) {
    throw new Error('The super-admin role cannot be updated or deleted.');
  }
}

// Delete role and permission
export async function DeleteRole(id: number) {
  const headers = await getAuthHeaders();
  try {
    await assertRoleCanBeManaged(id);
    const res = await api.delete(`/roles/${id}`, {
      headers,
      withCredentials: true
    });
    return {
      success: true,
      data: res.data
    };
  } catch (error: any) {
    const detail = error?.response?.data;
    const message =
      detail?.message ||
      detail?.error ||
      (typeof detail === 'string' ? detail : undefined) ||
      error?.message ||
      'Failed to delete role.';
    return {
      success: false,
      error: message
    };
  }
}
//Create role and permission
export async function CreateRole(payload: CreateRole) {
  const headers = await getAuthHeaders();
  try {
    const res = await api.post('/roles', payload, {
      headers,
      withCredentials: true
    });
    return res.data;
  } catch (error: any) {
    const detail = error?.response?.data;
    const message =
      detail?.message ||
      detail?.error ||
      (typeof detail === 'string' ? detail : undefined) ||
      error?.message ||
      'Failed to create role.';
    throw new Error(message);
  }
}
//Edit permission in role
export async function EditRole(id: number, payload: UpdateRolePermissions) {
  const headers = await getAuthHeaders();

  try {
    await assertRoleCanBeManaged(id);
    const res = await api.put(`/roles/${id}/permissions`, payload, {
      headers,
      withCredentials: true
    });
    return res.data;
  } catch (error: any) {
    const detail = error?.response?.data;
    const message =
      detail?.message ||
      detail?.error ||
      (typeof detail === 'string' ? detail : undefined) ||
      error?.message ||
      'Failed to edit role.';
    throw new Error(message);
  }
}

export async function UpdateRoleInfoById(id: number, payload: UpdateRoleInfo) {
  const headers = await getAuthHeaders();

  try {
    await assertRoleCanBeManaged(id);
    const res = await api.put(`/roles/${id}`, payload, {
      headers,
      withCredentials: true
    });
    return res.data;
  } catch (error: any) {
    const status = error?.response?.status;

    // Some environments accept PATCH instead of PUT for role info updates.
    // Retry once so the edit page works against both variants.
    if (status === 404 || status === 405) {
      try {
        const res = await api.patch(`/roles/${id}`, payload, {
          headers,
          withCredentials: true
        });
        return res.data;
      } catch (patchError: any) {
        const detail = patchError?.response?.data;
        const message =
          detail?.message ||
          detail?.error ||
          (typeof detail === 'string' ? detail : undefined) ||
          patchError?.message ||
          'Failed to update role info.';
        throw new Error(message);
      }
    }

    const detail = error?.response?.data;
    const message =
      detail?.message ||
      detail?.error ||
      (typeof detail === 'string' ? detail : undefined) ||
      error?.message ||
      'Failed to update role info.';
    throw new Error(message);
  }
}
