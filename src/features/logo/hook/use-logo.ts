import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

//Fetch Logo
async function FetchLogo() {
  const response = await api.get('/logo');
  return response.data;
}
//Get Logo
export function useLogo() {
  return useQuery({
    queryKey: ['logo'],
    queryFn: FetchLogo
  });
}
