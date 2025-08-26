'use client';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { usePost } from '@/hooks/use-post';
import { PostTableList } from './post-tables';

export default function PostsListPage() {
  const { data, isLoading } = usePost();
  if (isLoading) return <DataTableSkeleton columnCount={5} rowCount={8} />;
  const rows = (data?.data ?? data) as any[];
  return <PostTableList data={rows as any} />;
}
