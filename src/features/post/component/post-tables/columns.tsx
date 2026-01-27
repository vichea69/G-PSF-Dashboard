'use client';
import Image from 'next/image';
import { Column, ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { IconCircleCheck, IconCircleX } from '@tabler/icons-react';
import { CellAction } from './cell-action';
import { getLocalizedText } from '@/lib/helpers';
import { type LocalizedText } from '@/lib/helpers';
import { type Language } from '@/context/language-context';

export type PostRow = {
  id: number;
  title: string | LocalizedText;
  slug: string;
  content?: string;
  status: 'published' | 'draft' | string;
  images?: { id: number; url: string; sortOrder?: number | null }[];
  updatedAt: string;
  category?: { id: number; name: LocalizedText } | undefined;
  page?: { id: number; title?: LocalizedText; slug?: string } | undefined;
};

const postStatusBadge = (status: string) => {
  const normalized = status?.toLowerCase?.() ?? '';
  const isPublished = normalized === 'published';
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
};

export const getPostColumns = (language: Language): ColumnDef<PostRow>[] => [
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
    accessorFn: (row) => getLocalizedText(row.title ?? '', language) ?? '',
    header: ({ column }: { column: Column<PostRow, unknown> }) => (
      <DataTableColumnHeader column={column} title='Title' />
    ),
    enableColumnFilter: true,
    meta: { label: 'Title', placeholder: 'Search title...', variant: 'text' }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ cell }) => postStatusBadge(cell.getValue<string>())
  },
  {
    id: 'category',
    accessorFn: (row) =>
      getLocalizedText(row.category?.name ?? '', language) ?? '',
    header: 'Category'
  },
  {
    id: 'page',
    accessorFn: (row) =>
      getLocalizedText(row.page?.title ?? '', language) ?? row.page?.slug ?? '',
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
