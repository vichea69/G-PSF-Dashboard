'use client';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';

export type PageRow = {
  id: number;
  title: string;
  slug: string;
  status: 'published' | 'draft' | string;
  content: string;
  publishedAt: string;
  updatedAt: string;
  authorId: {
    id: number;
    displayName: string;
    email: string;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
};

const getStatusBadge = (status: string) => {
  const statusConfig = {
    published: {
      className: 'bg-green-100 text-green-800 border-green-200',
      label: 'Published'
    },
    draft: {
      className: 'bg-amber-100 text-amber-800 border-amber-200',
      label: 'Draft'
    },
    default: {
      className: 'bg-gray-100 text-gray-800 border-gray-200',
      label: 'Unknown'
    }
  } as const;

  const config =
    statusConfig[(status as keyof typeof statusConfig) ?? 'default'] ??
    statusConfig.default;

  return (
    <Badge variant='outline' className={config.className}>
      {config.label}
    </Badge>
  );
};
export const pageColumns: ColumnDef<PageRow>[] = [
  {
    id: 'name',
    accessorKey: 'title',
    header: ({ column }: { column: Column<PageRow, unknown> }) => (
      <DataTableColumnHeader column={column} title='Page Title' />
    ),
    cell: ({ cell }) => {
      const value = (cell.getValue<string>() ?? '').toString();
      const raw = cell.column.getFilterValue() as string | undefined;
      const term = (raw ?? '').trim();
      if (!term) return <div>{value}</div>;
      const escapeRegExp = (s: string) =>
        s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapeRegExp(term)})`, 'ig');
      const parts = value.split(regex);
      return (
        <div>
          {parts.map((part, i) =>
            regex.test(part) ? (
              <span key={i} className='font-semibold text-green-600'>
                {part}
              </span>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </div>
      );
    },
    meta: {
      label: 'Name',
      placeholder: 'Search name...',
      variant: 'text'
    }
  },
  {
    accessorKey: 'slug',
    header: 'URL',
    cell: ({ cell }) => (
      <div className='max-w-[360px] truncate'>/{cell.getValue<string>()}</div>
    )
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ cell }) => getStatusBadge(cell.getValue<string>())
  },
  {
    accessorKey: 'publishedAt',
    header: 'Published At'
  },
  {
    accessorKey: 'authorId.displayName',
    header: 'Created By'
  }
];
