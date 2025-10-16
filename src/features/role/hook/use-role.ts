'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  RoleAPI,
  type RoleResourceDefinition
} from '@/features/role/type/role';

// Get all roles from API
export const useRole = () => {
  return useQuery<RoleAPI[]>({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await api.get('/roles');
      return response.data.data;
    }
  });
};

//Get role by Slug from api
export const useRoleBySlug = (slug: string) => {
  return useQuery({
    enabled: !!slug,
    queryKey: ['role', slug],
    queryFn: async () => {
      const response = await api.get(`/roles/${slug}`);
      return response.data;
    }
  });
};
//Get All Resources from API
export const useResources = () => {
  return useQuery<RoleResourceDefinition[]>({
    queryKey: ['resources'],
    queryFn: async () => {
      const response = await api.get('/roles/resources/definition');
      return response.data.data;
    }
  });
};
