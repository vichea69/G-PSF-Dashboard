'use server';
import 'server-only';
import { api } from '@/lib/api';
import type { LocalizedText } from '@/lib/helpers';
import { getAuthHeaders } from '@/server/action/userAuth/user';

export type TestimonialInput = {
  title?: LocalizedText;
  quote?: LocalizedText;
  authorName?: LocalizedText;
  authorRole?: LocalizedText;
  company?: string;
  rating?: number;
  avatarUrl?: string;
  status?: 'published' | 'draft' | string;
  orderIndex?: number;
};

// Create testimonial
export async function createTestimonial(input: TestimonialInput) {
  const headers = await getAuthHeaders();
  const res = await api.post('/testimonials', input, {
    headers,
    withCredentials: true
  });
  return res.data;
}

// Update testimonial
export async function updateTestimonial(
  id: string | number,
  input: TestimonialInput
) {
  const headers = await getAuthHeaders();
  const res = await api.put(`/testimonials/${id}`, input, {
    headers,
    withCredentials: true
  });
  return res.data;
}

// Delete testimonial
export async function deleteTestimonial(id: string | number) {
  const headers = await getAuthHeaders();
  const res = await api.delete(`/testimonials/${id}`, {
    headers,
    withCredentials: true
  });
  return res.data;
}

// Get testimonial by id
export async function getTestimonialById(id: string | number) {
  const headers = await getAuthHeaders();
  const res = await api.get(`/testimonials/${id}`, {
    headers,
    withCredentials: true
  });
  return res.data;
}

// Get all testimonials
export async function getTestimonials() {
  const headers = await getAuthHeaders();
  const res = await api.get('/testimonials', {
    headers,
    withCredentials: true
  });
  return res.data;
}
