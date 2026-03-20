'use client';
import { useQuery } from '@tanstack/react-query';
import {
  type RoleDetailData,
  type RolePermissionInput,
  RoleAPI,
  type RoleResourceDefinition
} from '@/features/role/type/role';
import {
  getRoleById,
  getRolePermissions,
  getRoleResourceDefinitions,
  getRoles
} from '@/server/action/admin/role';

function extractData<T>(payload: unknown): T | null {
  const raw = payload as any;

  if (raw?.data !== undefined) {
    return raw.data as T;
  }

  return (raw ?? null) as T | null;
}

function extractRoles(payload: unknown): RoleAPI[] {
  // Role endpoints sometimes wrap the list inside `data.data`,
  // so we normalize everything here before the table uses it.
  const data = extractData<unknown>(payload);

  if (Array.isArray(data)) return data as RoleAPI[];
  if (Array.isArray((data as any)?.data))
    return (data as any).data as RoleAPI[];
  return [];
}

function extractRoleDetail(payload: unknown): RoleDetailData | null {
  // Edit role uses the newer `{ role, matrix, stats }` response shape,
  // but we keep a fallback for older flat role responses too.
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

// All role reads go through server actions so production requests keep auth headers.
export const useRole = ({ enabled = true }: { enabled?: boolean } = {}) => {
  return useQuery<RoleAPI[]>({
    enabled,
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await getRoles();
      return extractRoles(response);
    },
    staleTime: 5 * 60 * 1000,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false
  });
};

export const useRoleDetail = (identifier: string) => {
  return useQuery<RoleDetailData | null>({
    // Wait until we have a usable id before calling the backend.
    enabled: Boolean(identifier?.trim()),
    queryKey: ['role', identifier],
    queryFn: async () => {
      const response = await getRoleById(identifier);
      return extractRoleDetail(response);
    }
  });
};

export const useRolePermissions = (identifier?: string | number | null) => {
  const normalized = String(identifier ?? '').trim();

  return useQuery<RolePermissionInput[]>({
    enabled: Boolean(normalized),
    queryKey: ['role-permissions', normalized],
    queryFn: async () => {
      const response = await getRolePermissions(normalized);
      return extractRolePermissions(response);
    }
  });
};

export const useResources = () => {
  return useQuery<RoleResourceDefinition[]>({
    queryKey: ['resources'],
    queryFn: async () => {
      const response = await getRoleResourceDefinitions();
      return extractResources(response);
    }
  });
};
