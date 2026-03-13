'use server';
import 'server-only';
import { isAxiosError } from 'axios';
import { api } from '@/lib/api';
import { getAuthHeaders } from '@/server/action/userAuth/user';
import type {
  ActivityLogEvent,
  ActivityLogItem,
  ActivityLogListResult
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

type ActivityLogQueryParams = {
  page?: number;
  limit?: number;
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 100;

function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const payload = error.response?.data as any;
    const message = payload?.message ?? payload?.error ?? error.message;

    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string' && message.trim()) return message;

    return fallback;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

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

function toPositiveNumber(value: unknown, fallback: number) {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return Math.floor(value);
  }

  return fallback;
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

function normalizeActivityLogList(
  value: unknown,
  fallbackPage: number,
  fallbackLimit: number
): ActivityLogListResult {
  if (!value || typeof value !== 'object') {
    return {
      items: [],
      meta: {
        total: 0,
        page: fallbackPage,
        limit: fallbackLimit,
        totalPages: 1
      }
    };
  }

  const record = value as Record<string, unknown>;
  const rawItems = Array.isArray(record.items)
    ? record.items
    : Array.isArray(record.data)
      ? record.data
      : [];
  const metaValue =
    record.meta && typeof record.meta === 'object'
      ? (record.meta as Record<string, unknown>)
      : record;
  const items = rawItems.map((item) =>
    normalizeItem(item as ActivityLogApiItem)
  );
  const total = toPositiveNumber(metaValue?.total, items.length);
  const page = toPositiveNumber(metaValue?.page, fallbackPage);
  const limit = toPositiveNumber(metaValue?.limit, fallbackLimit);
  const totalPages = toPositiveNumber(
    metaValue?.totalPages,
    Math.max(1, Math.ceil(total / limit))
  );

  return {
    items,
    meta: {
      total,
      page,
      limit,
      totalPages
    }
  };
}

async function getActivityLogsPage(
  params: ActivityLogQueryParams = {}
): Promise<ActivityLogListResult> {
  const headers = await getAuthHeaders();
  const page = toPositiveNumber(params.page, DEFAULT_PAGE);
  const limit = toPositiveNumber(params.limit, DEFAULT_LIMIT);

  try {
    const res = await api.get('/activity-logs', {
      params: { page, limit },
      headers,
      withCredentials: true
    });
    const payload = res.data?.data ?? res.data;
    return normalizeActivityLogList(payload, page, limit);
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, 'Failed to fetch activity logs'));
  }
}

export async function getActivityLogs(): Promise<ActivityLogListResult> {
  const firstPage = await getActivityLogsPage({
    page: DEFAULT_PAGE,
    limit: DEFAULT_LIMIT
  });
  const totalPages = Math.max(1, firstPage.meta.totalPages);

  if (totalPages <= 1) {
    return firstPage;
  }

  const otherPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      getActivityLogsPage({
        page: index + 2,
        limit: firstPage.meta.limit || DEFAULT_LIMIT
      })
    )
  );
  const allItems = [firstPage, ...otherPages].flatMap((page) => page.items);

  return {
    items: allItems,
    meta: {
      total: Math.max(firstPage.meta.total, allItems.length),
      page: DEFAULT_PAGE,
      limit: allItems.length || firstPage.meta.limit,
      totalPages: 1
    }
  };
}
