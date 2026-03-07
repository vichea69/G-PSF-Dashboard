const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? '';

function getApiOrigin(value: string): string {
  try {
    return new URL(value).origin;
  } catch {
    return value.replace(/\/$/, '');
  }
}

const apiOrigin = getApiOrigin(apiBaseUrl);

export function resolveApiAssetUrl(value?: string | null): string {
  const raw = (value ?? '').trim();
  if (!raw) return '';

  if (
    raw.startsWith('http://') ||
    raw.startsWith('https://') ||
    raw.startsWith('data:') ||
    raw.startsWith('blob:')
  ) {
    return raw;
  }

  const normalizedPath = raw.startsWith('/') ? raw : `/${raw}`;
  return apiOrigin ? `${apiOrigin}${normalizedPath}` : normalizedPath;
}

export function toApiAssetPath(value?: string | null): string {
  const raw = (value ?? '').trim();
  if (!raw) return '';

  if (raw.startsWith('uploads/')) return raw;

  if (raw.startsWith('/uploads/')) {
    return raw.slice(1);
  }

  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    try {
      const pathname = new URL(raw).pathname;
      if (pathname.startsWith('/uploads/')) {
        return pathname.slice(1);
      }
      return pathname.replace(/^\/+/, '');
    } catch {
      return raw;
    }
  }

  return raw.replace(/^\/+/, '');
}
