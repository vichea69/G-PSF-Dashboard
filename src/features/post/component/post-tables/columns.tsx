'use client';
import Image from 'next/image';
import { Column, ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { IconCircleCheck, IconCircleX } from '@tabler/icons-react';
import { CellAction } from './cell-action';

export type PostRow = {
  id: number;
  title: string;
  slug: string;
  content?: string;
  status: 'published' | 'draft' | string;
  imageUrl?: string;
  updatedAt: string;
  category?: { id: number; name: string } | undefined;
  page?: { id: number; title: string; slug: string } | undefined;
};

export const postColumns: ColumnDef<PostRow>[] = [
  {
    accessorKey: 'imageUrl',
    header: 'IMAGE',
    cell: ({ row }) => {
      const original = row.original as any;
      const src = (row.getValue('imageUrl') as string) || original?.image || '';
      return src ? (
        <div className='relative h-20 w-20'>
          <Image
            src={src}
            alt={row.getValue('title') as string}
            fill
            className='rounded-md object-cover'
          />
        </div>
      ) : (
        <div className='bg-muted h-20 w-20 rounded-md' />
      );
    }
  },
  {
    id: 'title',
    accessorKey: 'title',
    header: ({ column }: { column: Column<PostRow, unknown> }) => (
      <DataTableColumnHeader column={column} title='Title' />
    ),
    enableColumnFilter: true,
    meta: { label: 'Title', placeholder: 'Search title...', variant: 'text' }
  },
  {
    accessorKey: 'slug',
    header: 'URL',
    cell: ({ cell }) => (
      <code className='bg-muted rounded px-2 py-0.5 font-mono text-xs'>
        /{cell.getValue<string>()}
      </code>
    )
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ cell }) => {
      const status = (cell.getValue<string>() || '').toLowerCase();
      const isPublished = status === 'published';
      return (
        <Badge
          variant='outline'
          className={
            isPublished
              ? 'gap-1 border-emerald-200 bg-emerald-100 text-emerald-700'
              : 'gap-1 border-amber-200 bg-amber-100 text-amber-700'
          }
        >
          {isPublished ? (
            <IconCircleCheck className='h-3 w-3' />
          ) : (
            <IconCircleX className='h-3 w-3' />
          )}{' '}
          {isPublished ? 'Published' : 'Draft'}
        </Badge>
      );
    }
  },
  {
    id: 'category',
    accessorFn: (row) => row.category?.name ?? '',
    header: 'Category'
  },
  {
    id: 'page',
    accessorFn: (row) => row.page?.title ?? '',
    header: 'Page'
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated'
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
