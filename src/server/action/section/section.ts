'use server';
import { baseAPI } from '@/lib/api';

//Delete section by id
export async function deleteSection(sectionId: number) {
  const response = await fetch(`${baseAPI}/sections/${sectionId}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to delete section');
  }
  return true;
}
