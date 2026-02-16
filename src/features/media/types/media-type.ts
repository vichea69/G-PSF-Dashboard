export type MediaFile = {
  id: string;
  name: string;
  type: 'image' | 'video' | 'pdf' | 'document';
  size: number;
  url: string;
  thumbnail?: string;
  uploadedAt: Date;
};

export type MediaApiItem = {
  id: number | string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: string | number;
  url: string;
  thumbnailUrl?: string;
  mediaType: string;
  storageDriver: string;
  createdAt: string;
};

export type MediaApiResponse = {
  success?: boolean;
  message?: string;
  page?: number;
  pageSize?: number;
  total?: number;
  data?: MediaApiItem[] | { items?: MediaApiItem[] };
};

export type MediaListResult = {
  items: MediaFile[];
  page: number;
  pageSize: number;
  total: number;
};

export function formatFileSize(bytes: number): string {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(k)),
    sizes.length - 1
  );
  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// Show full datetime in Phnom Penh timezone: YYYY-MM-DDTHH:mm:ss+07:00
export function formatDateTimePhnomPenh(date: Date): string {
  if (Number.isNaN(date.getTime())) return '-';

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Phnom_Penh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(date);

  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '';

  const year = getPart('year');
  const month = getPart('month');
  const day = getPart('day');
  const hour = getPart('hour');
  const minute = getPart('minute');
  const second = getPart('second');

  return `${year}-${month}-${day}T${hour}:${minute}:${second}+07:00`;
}

const apiBaseUrlRaw = process.env.NEXT_PUBLIC_API_URL || '';

function getApiOrigin(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return url.replace(/\/$/, '');
  }
}

const apiBaseOrigin = getApiOrigin(apiBaseUrlRaw);

function buildAbsoluteUrl(url: string): string {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:')
  ) {
    return url;
  }
  const normalizedPath = url.startsWith('/') ? url : `/${url}`;
  return apiBaseOrigin ? `${apiBaseOrigin}${normalizedPath}` : normalizedPath;
}

function resolveFileType(item: MediaApiItem): MediaFile['type'] {
  const mediaType = (item.mediaType || '').toLowerCase();
  const mimeType = (item.mimeType || '').toLowerCase();

  if (mediaType === 'image' || mimeType.startsWith('image/')) return 'image';
  if (mediaType === 'video' || mimeType.startsWith('video/')) return 'video';
  if (mimeType === 'application/pdf') return 'pdf';
  return 'document';
}

export function mapMediaItem(item: MediaApiItem): MediaFile {
  const uploadedAt = item.createdAt ? new Date(item.createdAt) : new Date();
  const size =
    typeof item.size === 'string' ? Number.parseInt(item.size, 10) : item.size;
  const type = resolveFileType(item);
  const url = buildAbsoluteUrl(item.url);
  // Use backend thumbnail when available (useful for PDF previews).
  const thumbnail = item.thumbnailUrl
    ? buildAbsoluteUrl(item.thumbnailUrl)
    : type === 'image'
      ? url
      : undefined;

  return {
    id: String(item.id),
    name: item.originalName || item.filename,
    type,
    size: Number.isNaN(size) ? 0 : size,
    url,
    thumbnail,
    uploadedAt: Number.isNaN(uploadedAt.getTime()) ? new Date() : uploadedAt
  };
}
