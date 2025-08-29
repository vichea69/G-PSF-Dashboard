'use client';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { usePost } from '@/hooks/use-post';
import { PostTableList } from './post-tables';

export default function PostsListPage() {
  const { data, isLoading } = usePost();
  if (isLoading) return <DataTableSkeleton columnCount={6} rowCount={8} />;
  const raw = (data?.data ?? data) as any;
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return <PostTableList data={list} />;
}
