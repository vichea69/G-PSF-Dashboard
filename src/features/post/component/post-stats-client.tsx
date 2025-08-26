'use client';
import { usePost } from '@/hooks/use-post';
import { PostStats } from './post-stats';

export default function PostStatsClient() {
  const { data, isLoading } = usePost();
  if (isLoading) return null;
  const rows = (data?.data ?? data) as any[];
  return <PostStats posts={rows ?? []} />;
}
