import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

// Get logo list from backend.
async function fetchLogos() {
  const response = await api.get('/logo');
  return response.data;
}

// React Query hook for logo list.
export function useLogo() {
  return useQuery({
    queryKey: ['logo'],
    queryFn: fetchLogos
  });
}
