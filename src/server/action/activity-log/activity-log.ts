'use server';
import 'server-only';
import { api } from '@/lib/api';
import { getAuthHeaders } from '@/server/action/userAuth/user';
import type {
  ActivityLogEvent,
  ActivityLogItem,
  ActivityLogListResult,
  ActivityLogMeta
} from '@/features/activity-log/types';

type ActivityLogApiItem = {
  id?: number | string;
  kind?: string;
  activity?: string;
  module?: string;
  user?: {
    id?: number | string;
    name?: string;
    email?: string;
    image?: string;
  };
  target?: {
    id?: number | string;
    type?: string;
    label?: string;
    url?: string;
  };
  date?: string;
};

function normalizeEvent(value: unknown): ActivityLogEvent {
  const kind = String(value ?? '')
    .trim()
    .toLowerCase();

  if (kind === 'created') return 'created';
  if (kind === 'deleted') return 'deleted';
  return 'updated';
}

function normalizeModule(value: unknown) {
  const modulePath = String(value ?? '').trim();
  if (!modulePath) return '/-';
  return modulePath.startsWith('/') ? modulePath : `/${modulePath}`;
}

function normalizeMeta(value: any): ActivityLogMeta {
  const total = Number(value?.total);
  const page = Number(value?.page);
  const limit = Number(value?.limit);
  const totalPages = Number(value?.totalPages);

  return {
    total: Number.isFinite(total) && total >= 0 ? Math.floor(total) : 0,
    page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1,
    limit: Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 20,
    totalPages:
      Number.isFinite(totalPages) && totalPages > 0 ? Math.floor(totalPages) : 1
  };
}

function buildAdminPathFromTarget(item: ActivityLogApiItem) {
  const rawUrl = String(item.target?.url ?? '').trim();

  if (rawUrl.startsWith('/posts/')) {
    return rawUrl.replace('/posts/', '/admin/post/');
  }
  if (rawUrl.startsWith('/pages/')) {
    return rawUrl.replace('/pages/', '/admin/page/');
  }
  if (rawUrl.startsWith('/categories/')) {
    return rawUrl.replace('/categories/', '/admin/category/');
  }
  if (rawUrl.startsWith('/sections/')) {
    return rawUrl.replace('/sections/', '/admin/section/');
  }
  if (rawUrl.startsWith('/working-groups/')) {
    return rawUrl.replace('/working-groups/', '/admin/working-group/');
  }
  if (rawUrl.startsWith('/testimonials/')) {
    return rawUrl.replace('/testimonials/', '/admin/testimonial/');
  }
  if (rawUrl.startsWith('/menus/')) {
    return rawUrl.replace('/menus/', '/admin/menu/');
  }
  if (rawUrl.startsWith('/users/')) {
    return '/admin/users';
  }

  const modulePath = normalizeModule(item.module);
  if (modulePath === '/post') return '/admin/post';
  if (modulePath === '/page') return '/admin/page';
  if (modulePath === '/category') return '/admin/category';
  if (modulePath === '/section') return '/admin/section';
  if (modulePath === '/working-group') return '/admin/working-group';
  if (modulePath === '/testimonial') return '/admin/testimonial';
  if (modulePath === '/menu') return '/admin/menu';
  if (modulePath === '/media') return '/admin/media';
  if (modulePath === '/auth') return '/admin/users';

  return '';
}

function normalizeItem(item: ActivityLogApiItem): ActivityLogItem {
  return {
    id: String(item.id ?? ''),
    event: normalizeEvent(item.kind),
    activity: String(item.activity ?? '').trim() || 'Activity',
    module: normalizeModule(item.module),
    userName: String(item.user?.name ?? '').trim() || '-',
    userEmail: String(item.user?.email ?? '').trim(),
    userAvatar: String(item.user?.image ?? '').trim(),
    targetLabel: String(item.target?.label ?? '').trim(),
    targetType: String(item.target?.type ?? '').trim(),
    date: String(item.date ?? '').trim(),
    contentPath: buildAdminPathFromTarget(item)
  };
}

export async function getActivityLogs(): Promise<ActivityLogListResult> {
  const headers = await getAuthHeaders();

  const res = await api.get('/activity-logs', {
    headers,
    withCredentials: true
  });

  const payload = res.data?.data ?? {};
  const items = Array.isArray(payload?.items)
    ? payload.items.map(normalizeItem)
    : [];

  return {
    items,
    meta: normalizeMeta(payload?.meta)
  };
}
