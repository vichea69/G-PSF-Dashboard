'use server';
import { baseAPI } from '@/lib/api';
import type { SectionPayload } from './types';

//Create section
export async function createSection(data: SectionPayload) {
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
  sectionId: number | string,
  data: Partial<SectionPayload>
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

//Get section by id
export async function getSectionById(sectionId: number | string) {
  const response = await fetch(`${baseAPI}/sections/${sectionId}`, {
    credentials: 'include',
    cache: 'no-store'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch section');
  }
  return response.json();
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
