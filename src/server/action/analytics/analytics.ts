'use server';
import 'server-only';

import { cache } from 'react';
import { api } from '@/lib/api';
import { getAuthHeaders } from '@/server/action/userAuth/user';
import type {
  AnalyticsCountry,
  AnalyticsBrowser,
  AnalyticsOverviewData,
  AnalyticsTimelinePoint,
  AnalyticsTopPage
} from './types';

type AnyRecord = Record<string, unknown>;

const EMPTY_OVERVIEW: AnalyticsOverviewData = {
  summary: {
    sessions: 0,
    sessionsChange: null,
    activeUsers: 0,
    activeUsersChange: null,
    newUsers: 0,
    newUsersChange: null,
    pageViews: 0,
    pageViewsChange: null
  },
  timeline: []
};

function isRecord(value: unknown): value is AnyRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function unwrapPayload(value: unknown): unknown {
  let current = value;

  for (let i = 0; i < 2; i += 1) {
    if (isRecord(current) && 'data' in current) {
      current = current.data;
      continue;
    }

    break;
  }

  return current;
}

function getApiErrorMessage(error: unknown, fallback: string) {
  const detail = (error as any)?.response?.data;
  const message =
    detail?.message ||
    detail?.error ||
    (typeof detail === 'string' ? detail : undefined) ||
    (error as Error)?.message ||
    fallback;

  if (Array.isArray(message)) {
    return message.join(', ');
  }

  return typeof message === 'string' && message.trim() ? message : fallback;
}

function readNumber(value: unknown, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const cleaned = value.replace(/[,%\s]/g, '');
    const parsed = Number(cleaned);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function readNullableNumber(record: AnyRecord | null, keys: string[]) {
  if (!record) return null;

  for (const key of keys) {
    if (!(key in record)) continue;
    const value = readNumber(record[key], Number.NaN);
    if (Number.isFinite(value)) {
      return value;
    }
  }

  return null;
}

function readNumberFromRecord(
  record: AnyRecord | null,
  keys: string[],
  fallback = 0
) {
  if (!record) return fallback;

  for (const key of keys) {
    if (!(key in record)) continue;
    const value = readNumber(record[key], Number.NaN);
    if (Number.isFinite(value)) {
      return value;
    }
  }

  return fallback;
}

function readStringFromRecord(
  record: AnyRecord | null,
  keys: string[],
  fallback = ''
) {
  if (!record) return fallback;

  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return fallback;
}

function readRecord(record: AnyRecord | null, keys: string[]) {
  if (!record) return null;

  for (const key of keys) {
    const value = record[key];
    if (isRecord(value)) {
      return value;
    }
  }

  return null;
}

function readArray(record: AnyRecord | null, keys: string[]) {
  if (!record) return [];

  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
}

function normalizeTimelinePoint(
  item: unknown,
  index: number
): AnalyticsTimelinePoint {
  const record = isRecord(item) ? item : null;

  return {
    label:
      readStringFromRecord(record, [
        'label',
        'date',
        'day',
        'month',
        'period',
        'dimension',
        'name'
      ]) || `Point ${index + 1}`,
    sessions: readNumberFromRecord(record, [
      'sessions',
      'sessionCount',
      'visitors'
    ]),
    activeUsers: readNumberFromRecord(record, [
      'activeUsers',
      'users',
      'totalUsers'
    ]),
    newUsers: readNumberFromRecord(record, ['newUsers', 'newVisitors']),
    pageViews: readNumberFromRecord(record, [
      'pageViews',
      'screenPageViews',
      'views',
      'totalViews'
    ])
  };
}

function normalizeOverviewResponse(payload: unknown): AnalyticsOverviewData {
  const root = unwrapPayload(payload);
  const record = isRecord(root) ? root : null;

  if (!record) {
    return EMPTY_OVERVIEW;
  }

  const summaryRecord =
    readRecord(record, ['summary', 'overview', 'totals', 'stats', 'metrics']) ??
    record;

  const timelineSource = readArray(record, [
    'timeline',
    'trend',
    'series',
    'chart',
    'timeseries',
    'rows'
  ]);

  return {
    summary: {
      sessions: readNumberFromRecord(summaryRecord, [
        'sessions',
        'sessionCount',
        'totalSessions'
      ]),
      sessionsChange: readNullableNumber(summaryRecord, [
        'sessionsChange',
        'sessionsChangePct',
        'sessionGrowthRate',
        'sessionsGrowth'
      ]),
      activeUsers: readNumberFromRecord(summaryRecord, [
        'activeUsers',
        'users',
        'totalUsers'
      ]),
      activeUsersChange: readNullableNumber(summaryRecord, [
        'activeUsersChange',
        'activeUsersChangePct',
        'usersGrowthRate',
        'activeUsersGrowth'
      ]),
      newUsers: readNumberFromRecord(summaryRecord, [
        'newUsers',
        'newVisitors',
        'totalNewUsers'
      ]),
      newUsersChange: readNullableNumber(summaryRecord, [
        'newUsersChange',
        'newUsersChangePct',
        'newUsersGrowthRate'
      ]),
      pageViews: readNumberFromRecord(summaryRecord, [
        'pageViews',
        'screenPageViews',
        'views',
        'totalViews'
      ]),
      pageViewsChange: readNullableNumber(summaryRecord, [
        'pageViewsChange',
        'pageViewsChangePct',
        'viewsGrowthRate'
      ])
    },
    timeline: timelineSource.map(normalizeTimelinePoint)
  };
}

function normalizeTopPagesResponse(payload: unknown): AnalyticsTopPage[] {
  const root = unwrapPayload(payload);

  const items = Array.isArray(root)
    ? root
    : readArray(isRecord(root) ? root : null, [
        'items',
        'pages',
        'topPages',
        'rows'
      ]);

  return items
    .map((item) => {
      const record = isRecord(item) ? item : null;
      const path = readStringFromRecord(record, [
        'path',
        'pagePath',
        'url',
        'pathname'
      ]);

      return {
        title:
          readStringFromRecord(record, [
            'title',
            'pageTitle',
            'name',
            'pageName'
          ]) ||
          path ||
          'Untitled page',
        path,
        visitors: readNumberFromRecord(record, [
          'visitors',
          'views',
          'pageViews',
          'screenPageViews',
          'sessions'
        ])
      };
    })
    .filter((item) => item.title || item.path || item.visitors > 0)
    .sort((left, right) => right.visitors - left.visitors);
}

function normalizeCountriesResponse(payload: unknown): AnalyticsCountry[] {
  const root = unwrapPayload(payload);

  const items = Array.isArray(root)
    ? root
    : readArray(isRecord(root) ? root : null, ['items', 'countries', 'rows']);

  return items
    .map((item) => {
      const record = isRecord(item) ? item : null;

      return {
        country:
          readStringFromRecord(record, ['country', 'name', 'label']) ||
          'Unknown',
        visitors: readNumberFromRecord(record, [
          'visitors',
          'activeUsers',
          'users',
          'sessions'
        ])
      };
    })
    .filter((item) => item.visitors > 0)
    .sort((left, right) => right.visitors - left.visitors);
}

function normalizeBrowsersResponse(payload: unknown): AnalyticsBrowser[] {
  const root = unwrapPayload(payload);

  const items = Array.isArray(root)
    ? root
    : readArray(isRecord(root) ? root : null, ['items', 'browsers', 'rows']);

  return items
    .map((item) => {
      const record = isRecord(item) ? item : null;

      return {
        browser:
          readStringFromRecord(record, [
            'browser',
            'browserName',
            'name',
            'label'
          ]) || 'Unknown',
        visitors: readNumberFromRecord(record, [
          'visitors',
          'activeUsers',
          'users',
          'sessions'
        ])
      };
    })
    .filter((item) => item.visitors > 0)
    .sort((left, right) => right.visitors - left.visitors);
}

async function getAnalyticsResponse(endpoint: string) {
  const headers = await getAuthHeaders();
  const response = await api.get(endpoint, {
    headers,
    withCredentials: true
  });

  return response.data;
}

export const getAnalyticsOverview = cache(async () => {
  try {
    const payload = await getAnalyticsResponse('/analytics/overview');
    return normalizeOverviewResponse(payload);
  } catch (error: unknown) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to load analytics overview')
    );
  }
});

export const getAnalyticsTopPages = cache(async () => {
  try {
    const payload = await getAnalyticsResponse('/analytics/top-pages');
    return normalizeTopPagesResponse(payload);
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, 'Failed to load top pages'));
  }
});

export const getAnalyticsCountries = cache(async () => {
  try {
    const payload = await getAnalyticsResponse('/analytics/countries');
    return normalizeCountriesResponse(payload);
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, 'Failed to load countries'));
  }
});

export const getAnalyticsBrowsers = cache(async () => {
  try {
    const payload = await getAnalyticsResponse('/analytics/browsers');
    return normalizeBrowsersResponse(payload);
  } catch (error: unknown) {
    throw new Error(getApiErrorMessage(error, 'Failed to load browsers'));
  }
});
