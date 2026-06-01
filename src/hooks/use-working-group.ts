'use client';
import { useQuery } from '@tanstack/react-query';
import {
  getWorkingGroups,
  getWorkingGroupPostTargets
} from '@/server/action/working-group/working-group';

export function useWorkingGroups() {
  return useQuery({
    queryKey: ['working-groups'],
    queryFn: getWorkingGroups
  });
}

export function useWorkingGroup() {
  return useWorkingGroups();
}

export function useWorkingGroupPostTargets(id?: number | string | null) {
  const normalizedId =
    id === undefined || id === null || id === '' ? null : Number(id);
  const enabled = normalizedId !== null && Number.isFinite(normalizedId);

  return useQuery({
    queryKey: ['working-group-post-targets', normalizedId],
    queryFn: () => getWorkingGroupPostTargets(normalizedId as number),
    enabled
  });
}
