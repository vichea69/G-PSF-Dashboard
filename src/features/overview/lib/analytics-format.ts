const numberFormatter = new Intl.NumberFormat('en-US');

export function formatMetricValue(value: number, kind: 'number' | 'percent') {
  if (kind === 'percent') {
    return `${value.toFixed(1)}%`;
  }

  return numberFormatter.format(Math.round(value));
}

export function formatChangeValue(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return null;
  }

  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(1)}%`;
}

export function getTrendDirection(value: number | null) {
  if (value === null || Number.isNaN(value) || value === 0) {
    return 'neutral' as const;
  }

  return value > 0 ? 'up' : 'down';
}

export function formatAxisLabel(label: string) {
  const parsedDate = new Date(label);

  if (
    !Number.isNaN(parsedDate.getTime()) &&
    /^\d{4}-\d{2}-\d{2}/.test(label.trim())
  ) {
    return parsedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  return label.length > 3 ? label.slice(0, 3) : label;
}

export function formatLongDateLabel(label: string) {
  const parsedDate = new Date(label);

  if (
    !Number.isNaN(parsedDate.getTime()) &&
    /^\d{4}-\d{2}-\d{2}/.test(label.trim())
  ) {
    return parsedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  return label;
}

export function getInitials(value: string) {
  const parts = value
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return 'NA';
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
}
