import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export const useLogo = () => {
  return useQuery({
    queryKey: ['logo'],
    queryFn: async () => {
      // Try to include Authorization if available on client
      let headers: Record<string, string> | undefined;
      if (typeof window !== 'undefined') {
        const token = document.cookie
          .split('; ')
          .find((row) => row.startsWith('access_token='))
          ?.split('=')[1];
        if (token)
          headers = { Authorization: `Bearer ${decodeURIComponent(token)}` };
      }
      const response = await api.get('/logo', {
        headers,
        withCredentials: true
      });
      return response.data;
    }
  });
};
