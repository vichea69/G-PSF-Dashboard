'use server';
import { baseAPI } from '@/lib/api';

//Create section
export async function createSection(data: {
  pageSlug: string;
  blockType: string;
  title?: string;
  data?: { headline?: string; subheadline?: string } | null;
  enabled?: boolean;
  orderIndex?: number;
}) {
  const response = await fetch(`${baseAPI}/sections`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    throw new Error('Failed to create section');
  }
  const section = await response.json();
  return section;
}

//Update section
export async function updateSection(
  sectionId: number,
  data: {
    pageSlug?: string;
    blockType?: string;
    title?: string;
    data?: { headline?: string; subheadline?: string } | null;
    enabled?: boolean;
    orderIndex?: number;
  }
) {
  const response = await fetch(`${baseAPI}/sections/${sectionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    throw new Error('Failed to update section');
  }
  const section = await response.json();
  return section;
}

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
