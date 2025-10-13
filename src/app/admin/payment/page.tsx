'use client';
import { columns } from './columns';
import { DataTable } from './data-table';
import { useRole } from '@/features/role/hook/use-role';

export default function DemoPage() {
  const { data, isLoading, isError } = useRole();

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Something went wrong.</p>;

  return (
    <div className='container mx-auto py-10'>
      <DataTable columns={columns} data={data ?? []} />
    </div>
  );
}
