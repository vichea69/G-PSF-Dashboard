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
  images?: { id: number; url: string; sortOrder?: number | null }[];
  updatedAt: string;
  category?: { id: number; name: string } | undefined;
  page?: { id: number; title: string; slug: string } | undefined;
};

export const postColumns: ColumnDef<PostRow>[] = [
  {
    id: 'image',
    accessorFn: (row) => row.images?.[0]?.url ?? '',
    header: 'IMAGE',
    cell: ({ row }) => {
      const original = row.original as any;
      const images = Array.isArray(original?.images) ? original.images : [];
      const src =
        images?.[0]?.url ||
        (row.getValue('image') as string) ||
        original?.imageUrl ||
        original?.image ||
        '';

      return src ? (
        <div className='relative h-20 w-20'>
          <Image
            src={src}
            alt={row.getValue('title') as string}
            fill
            className='rounded-md object-cover'
          />
          {images.length > 1 ? (
            <span className='bg-background/80 text-muted-foreground absolute right-1 bottom-1 rounded px-1 text-[10px] font-medium shadow-sm'>
              +{images.length - 1}
            </span>
          ) : null}
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
  // {
  //   accessorKey: 'slug',
  //   header: 'URL',
  //   cell: ({ cell }) => (
  //     <code className='bg-muted rounded px-2 py-0.5 font-mono text-xs'>
  //       /{cell.getValue<string>()}
  //     </code>
  //   )
  // },
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
