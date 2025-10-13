'use client';
import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';

function toDateSafe(
  input: string | number | Date | undefined | null
): Date | null {
  if (!input) return null;
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
  if (typeof input === 'number') {
    const ms = input < 1e12 ? input * 1000 : input;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }
  const trimmed = input.trim();
  if (/^\d+$/.test(trimmed)) {
    const n = Number(trimmed);
    const ms = n < 1e12 ? n * 1000 : n;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(trimmed);
  return isNaN(d.getTime()) ? null : d;
}

export function RelativeTime({
  value,
  className
}: {
  value: string | number | Date | null | undefined;
  className?: string;
}) {
  const date = useMemo(() => toDateSafe(value ?? undefined), [value]);
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  if (!date) return <span className={className}>-</span>;

  // 🗓️ Short format like "Mon 13 Oct 25"
  const formatted = format(date, 'EEEE dd MMM yyyy');

  return (
    <span className={className} title={date.toLocaleString()}>
      {formatted}
    </span>
  );
}
