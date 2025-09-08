// Logo actions
'use server';
import 'server-only';
import { api } from '@/lib/api';

export async function createLogo(formData: FormData) {
  const res = await api.post('/logo', formData, {
    // Let Axios set multipart boundary automatically
    withCredentials: true
  });
  return res.data;
}

export async function updateLogo(id: string | number, formData: FormData) {
  const res = await api.put(
    `/logo/${encodeURIComponent(String(id))}`,
    formData,
    {
      withCredentials: true
    }
  );
  return res.data;
}

export async function deleteLogo(id: string | number) {
  const res = await api.delete(`/logo/${encodeURIComponent(String(id))}`, {
    withCredentials: true
  });
  return res.data;
}
