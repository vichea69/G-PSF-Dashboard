'use client';
//fecth all users from api
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export const useUser = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data;
    }
  });
};
//fecth user by id from api
export const useUserById = (id: number | string | undefined) => {
  return useQuery({
    enabled: !!id,
    queryKey: ['user', id],
    queryFn: async () => {
      const response = await api.get(`/users/${id}`);
      return response.data;
    }
  });
};
