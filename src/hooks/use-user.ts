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
