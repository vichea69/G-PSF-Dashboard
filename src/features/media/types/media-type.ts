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
  mediaType: string;
  storageDriver: string;
  createdAt: string;
};

export type MediaApiResponse = {
  data?: {
    items?: MediaApiItem[];
  };
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

  return {
    id: String(item.id),
    name: item.originalName || item.filename,
    type,
    size: Number.isNaN(size) ? 0 : size,
    url: buildAbsoluteUrl(item.url),
    thumbnail: type === 'image' ? buildAbsoluteUrl(item.url) : undefined,
    uploadedAt: Number.isNaN(uploadedAt.getTime()) ? new Date() : uploadedAt
  };
}
