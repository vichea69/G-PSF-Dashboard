'use server';
import { baseAPI } from '@/lib/api';

//Create Site Setting
export async function CreateSiteSetting(formData: FormData) {
  const res = await fetch(`${baseAPI}/site-settings`, {
    method: 'POST',
    credentials: 'include',
    body: formData
  });

  if (!res.ok) {
    throw new Error('Failed to create site setting');
  }

  return res.json();
}

//Update Site Setting
export async function UpdateSiteSetting(id: number | string, data: FormData) {
  const res = await fetch(`${baseAPI}/site-settings/${id}`, {
    method: 'PUT',
    credentials: 'include',
    body: data
  });

  if (!res.ok) {
    throw new Error('Failed to update site setting');
  }

  return res.json();
}
