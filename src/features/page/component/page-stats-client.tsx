'use client';
import { usePage } from '@/hooks/use-page';
import { PageStats } from './page-states';

export default function PageStatsClient() {
  const { data, isLoading } = usePage();
  if (isLoading) return null;
  const rows = (data?.data ?? data) as any[];
  return <PageStats pages={rows ?? []} />;
}
