//fetch all menus from api
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export const useMenu = () => {
  return useQuery({
    queryKey: ['menus'],
    queryFn: async () => {
      const response = await api.get('/menus/tree');
      return response.data;
    }
  });
};
