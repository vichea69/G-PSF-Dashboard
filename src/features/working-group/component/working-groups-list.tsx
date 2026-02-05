'use client';

import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { useWorkingGroups } from '@/hooks/use-working-group';
import { WorkingGroupTableList } from './working-group-tables';

export default function WorkingGroupsListPage() {
  const { data, isLoading } = useWorkingGroups();

  if (isLoading) {
    return <DataTableSkeleton columnCount={6} rowCount={8} />;
  }

  return <WorkingGroupTableList data={data ?? []} />;
}
