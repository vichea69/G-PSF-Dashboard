'use client';
import { useQuery } from '@tanstack/react-query';
import { getWorkingGroups } from '@/server/action/working-group/working-group';

export function useWorkingGroups() {
  return useQuery({
    queryKey: ['working-groups'],
    queryFn: getWorkingGroups
  });
}

export function useWorkingGroup() {
  return useWorkingGroups();
}
