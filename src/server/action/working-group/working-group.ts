'use server';
import 'server-only';

import { api } from '@/lib/api';
import { getAuthHeaders } from '@/server/action/userAuth/user';
import type {
  WorkingGroupInput,
  WorkingGroupItem,
  WorkingGroupPostTargets
} from './working-group-type';

type WorkingGroupListResponse = {
  data?: {
    items?: WorkingGroupItem[];
  };
};

type WorkingGroupDetailResponse = {
  data?: WorkingGroupItem;
};

type WorkingGroupPostTargetsResponse = {
  data?: WorkingGroupPostTargets;
};

//Get list of working groups
export async function getWorkingGroups(): Promise<WorkingGroupItem[]> {
  const headers = await getAuthHeaders();
  const res = await api.get<WorkingGroupListResponse>('/working-groups', {
    headers,
    withCredentials: true
  });

  return res.data?.data?.items ?? [];
}

//Create a new working group
export async function createWorkingGroup(input: WorkingGroupInput) {
  const headers = await getAuthHeaders();
  const res = await api.post('/working-groups', input, {
    headers,
    withCredentials: true
  });
  return res.data;
}

//Update working group
export async function updateWorkingGroup(
  id: string | number,
  input: WorkingGroupInput
) {
  const headers = await getAuthHeaders();
  const res = await api.put(`/working-groups/${id}`, input, {
    headers,
    withCredentials: true
  });
  return res.data;
}

//Get working group by id
export async function getWorkingGroupById(
  id: string | number
): Promise<WorkingGroupItem | null> {
  const headers = await getAuthHeaders();
  const res = await api.get<WorkingGroupDetailResponse>(
    `/working-groups/${id}`,
    {
      headers,
      withCredentials: true
    }
  );
  return res.data?.data ?? null;
}

//Get post targets (page + post_list sections + allowed categories) for a working group
export async function getWorkingGroupPostTargets(
  id: string | number
): Promise<WorkingGroupPostTargets | null> {
  const headers = await getAuthHeaders();
  const res = await api.get<WorkingGroupPostTargetsResponse>(
    `/working-groups/${id}/post-targets`,
    {
      headers,
      withCredentials: true
    }
  );
  return res.data?.data ?? null;
}

//Delete working group
export async function deleteWorkingGroup(id: string | number) {
  const headers = await getAuthHeaders();
  const res = await api.delete(`/working-groups/${id}`, {
    headers,
    withCredentials: true
  });
  return res.data;
}
