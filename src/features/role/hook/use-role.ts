'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  type RoleDetailData,
  type RolePermissionInput,
  RoleAPI,
  type RoleResourceDefinition
} from '@/features/role/type/role';

function extractData<T>(payload: unknown): T | null {
  const raw = payload as any;

  if (raw?.data !== undefined) {
    return raw.data as T;
  }

  return (raw ?? null) as T | null;
}

function extractRoles(payload: unknown): RoleAPI[] {
  const data = extractData<unknown>(payload);

  if (Array.isArray(data)) return data as RoleAPI[];
  if (Array.isArray((data as any)?.data))
    return (data as any).data as RoleAPI[];
  return [];
}

function extractRoleDetail(payload: unknown): RoleDetailData | null {
  const data = extractData<unknown>(payload);

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const raw = data as any;

    if (raw.role && typeof raw.role === 'object') {
      return {
        role: raw.role as RoleAPI,
        matrix: Array.isArray(raw.matrix) ? raw.matrix : [],
        stats: raw.stats && typeof raw.stats === 'object' ? raw.stats : null
      };
    }

    if (typeof raw.id === 'number' && typeof raw.name === 'string') {
      return {
        role: raw as RoleAPI,
        matrix: [],
        stats: null
      };
    }
  }

  return null;
}

function extractResources(payload: unknown): RoleResourceDefinition[] {
  const data = extractData<unknown>(payload);

  if (Array.isArray(data)) return data as RoleResourceDefinition[];
  if (Array.isArray((data as any)?.data)) {
    return (data as any).data as RoleResourceDefinition[];
  }

  return [];
}

function extractRolePermissions(payload: unknown): RolePermissionInput[] {
  const data = extractData<unknown>(payload);

  if (Array.isArray(data)) return data as RolePermissionInput[];
  if (Array.isArray((data as any)?.permissions)) {
    return (data as any).permissions as RolePermissionInput[];
  }

  return [];
}

// Get all roles from API
export const useRole = () => {
  return useQuery<RoleAPI[]>({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await api.get('/roles');
      return extractRoles(response.data);
    }
  });
};

export const useRoleDetail = (identifier: string) => {
  return useQuery<RoleDetailData | null>({
    enabled: Boolean(identifier?.trim()),
    queryKey: ['role', identifier],
    queryFn: async () => {
      const response = await api.get(`/roles/${identifier}`);
      return extractRoleDetail(response.data);
    }
  });
};

export const useRolePermissions = (identifier?: string | number | null) => {
  const normalized = String(identifier ?? '').trim();

  return useQuery<RolePermissionInput[]>({
    enabled: Boolean(normalized),
    queryKey: ['role-permissions', normalized],
    queryFn: async () => {
      const response = await api.get(`/roles/${normalized}/permissions`);
      return extractRolePermissions(response.data);
    }
  });
};

export const useResources = () => {
  return useQuery<RoleResourceDefinition[]>({
    queryKey: ['resources'],
    queryFn: async () => {
      const response = await api.get('/roles/resources/definition');
      return extractResources(response.data);
    }
  });
};
