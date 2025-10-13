'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { RoleAPI } from '@/features/role/type/role';

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

//Get role by Name from api
export const useRoleByName = (name: string) => {
  return useQuery({
    enabled: !!name,
    queryKey: ['role', name],
    queryFn: async () => {
      const response = await api.get(`/roles/${name}`);
      return response.data;
    }
  });
};
