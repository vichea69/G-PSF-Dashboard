'use client';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { CellAction } from './cell-action';

export type PostRow = {
  id: number;
  title: string;
  slug: string;
  content?: string;
  status: 'published' | 'draft' | string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  author?: {
    id: number;
    displayName: string;
    email: string;
  };
  category?: { id: number; name: string };
  page?: { id: number; title: string; slug: string };
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

export const postColumns: ColumnDef<PostRow>[] = [
  {
    accessorKey: 'imageUrl',
    header: 'IMAGE',
    cell: ({ row }) => {
      const src = row.getValue<string>('imageUrl') as string;
      const alt = row.getValue<string>('title') as string;
      if (!src) return null;
      return (
        <div className='relative h-24 w-24 overflow-hidden rounded-md'>
          <Image
            src={src}
            alt={alt || 'Post image'}
            fill
            className='object-cover'
          />
        </div>
      );
    }
  },
  {
    id: 'title',
    accessorKey: 'title',
    header: ({ column }: { column: Column<PostRow, unknown> }) => (
      <DataTableColumnHeader column={column} title='Post Title' />
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
      label: 'Title',
      placeholder: 'Search title...',
      variant: 'text'
    }
  },
  //   {
  //     accessorKey: 'slug',
  //     header: 'URL',
  //     cell: ({ cell }) => (
  //       <div className='max-w-[360px] truncate'>/post/{cell.getValue<string>()}</div>
  //     )
  //   },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ cell }) => getStatusBadge(cell.getValue<string>())
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At'
  },
  {
    accessorKey: 'author.displayName',
    header: 'Author'
  },
  {
    accessorKey: 'category.name',
    header: 'Category'
  },
  {
    accessorKey: 'page.title',
    header: 'Page'
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
