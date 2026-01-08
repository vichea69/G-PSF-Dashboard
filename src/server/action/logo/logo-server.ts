'use server';
import { baseAPI } from '@/lib/api';
import { getAuthHeaders } from '@/server/action/userAuth/user';

//Fetch all logo
export async function getLogo() {
  const res = await fetch(`${baseAPI}/logo`, {
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch logo (${res.status})`);
  }

  return res.json();
}
