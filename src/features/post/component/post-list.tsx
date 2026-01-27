'use client';
import { useMemo } from 'react';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { usePost } from '@/hooks/use-post';
import { PostTableList } from './post-tables';

export default function PostsListPage() {
  const { data, isLoading } = usePost();
  const list = useMemo(() => {
    const raw = (data?.data ?? data) as any;
    return Array.isArray(raw) ? raw : raw ? [raw] : [];
  }, [data]);
  if (isLoading) return <DataTableSkeleton columnCount={6} rowCount={8} />;
  return <PostTableList data={list} />;
}
