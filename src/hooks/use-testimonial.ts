'use client';
import { useQuery } from '@tanstack/react-query';
import { getTestimonials } from '@/server/action/testimonail/testimonail';

export function useTestimonial() {
  return useQuery({
    queryKey: ['testimonials'],
    queryFn: getTestimonials
  });
}

export function useTestimonials() {
  return useTestimonial();
}
