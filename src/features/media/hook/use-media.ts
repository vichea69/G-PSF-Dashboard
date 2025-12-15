import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

//Fetch Media
async function FetchMedia() {
  const response = await api.get('/media');
  return response.data;
}
//Get Media
export function useMedia() {
  return useQuery({
    queryKey: ['media'],
    queryFn: FetchMedia
  });
}
