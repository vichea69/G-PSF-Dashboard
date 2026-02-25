'use client';
import { extractPageRows, usePage } from '@/hooks/use-page';
import { PageStats } from './page-states';

export default function PageStatsClient() {
  const { data, isLoading } = usePage();
  if (isLoading) return null;
  const rows = extractPageRows(data);
  return <PageStats pages={rows ?? []} />;
}
