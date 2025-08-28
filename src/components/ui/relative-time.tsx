'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  differenceInSeconds,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears
} from 'date-fns';

function toDateSafe(
  input: string | number | Date | undefined | null
): Date | null {
  if (!input) return null;
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
  if (typeof input === 'number') {
    // Detect seconds vs milliseconds (seconds are too small)
    const ms = input < 1e12 ? input * 1000 : input;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }
  // string
  const trimmed = input.trim();
  // If numeric string, treat as epoch seconds/milliseconds
  if (/^\d+$/.test(trimmed)) {
    const n = Number(trimmed);
    const ms = n < 1e12 ? n * 1000 : n;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(trimmed);
  return isNaN(d.getTime()) ? null : d;
}

function formatRelativeShort(from: Date, to: Date): string {
  const sec = Math.max(0, differenceInSeconds(to, from));
  if (sec < 45) return 'just now';
  const min = differenceInMinutes(to, from);
  if (min < 60) return `${min}m ago`;
  const hr = differenceInHours(to, from);
  if (hr < 24) return `${hr}h ago`;
  const d = differenceInDays(to, from);
  if (d < 7) return `${d}d ago`;
  const w = differenceInWeeks(to, from);
  if (w < 5) return `${w}w ago`;
  const mo = differenceInMonths(to, from);
  if (mo < 12) return `${mo}mo ago`;
  const y = differenceInYears(to, from);
  return `${y}y ago`;
}

export function RelativeTime({
  value,
  short = true,
  className
}: {
  value: string | number | Date | null | undefined;
  short?: boolean;
  className?: string;
}) {
  const date = useMemo(() => toDateSafe(value ?? undefined), [value]);
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    // update every 30s for seconds/minutes freshness
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  if (!date) return <span className={className}>-</span>;

  const label = short
    ? formatRelativeShort(date, now)
    : // Fallback long text if needed later
      formatRelativeShort(date, now);

  return (
    <span className={className} title={date.toLocaleString()}>
      {label}
    </span>
  );
}
