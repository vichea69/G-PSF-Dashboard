'use client';
import Image from 'next/image';
import { Column, ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { RelativeTime } from '@/components/ui/relative-time';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';

export type LogoRow = {
  id: number;
  title: string;
  url: string;
  link: string;
  description: string;
  updatedAt: string;
  createdAt: string;
};

export const logoColumns: ColumnDef<LogoRow>[] = [
  {
    id: 'id',
    accessorFn: (row) => String((row as LogoRow).id ?? ''),
    header: 'ID'
  },
  {
    id: 'url',
    header: 'Logo',
    cell: ({ row }) => {
      const src = (row.original as LogoRow).url;
      const alt = (row.original as LogoRow).title || 'logo';
      return src ? (
        <div className='relative h-16 w-16'>
          <Image
            src={src}
            alt={alt}
            fill
            className='rounded-md object-contain'
          />
        </div>
      ) : (
        <div className='bg-muted h-16 w-16 rounded-md' />
      );
    }
  },
  {
    id: 'title',
    accessorFn: (row) => (row as LogoRow).title,
    header: ({ column }: { column: Column<LogoRow, unknown> }) => (
      <DataTableColumnHeader column={column} title='Company Name' />
    ),
    enableColumnFilter: true,
    meta: {
      label: 'Company Name',
      placeholder: 'Search company name...',
      variant: 'text'
    }
  },
  {
    id: 'description',
    accessorFn: (row) => (row as LogoRow).description,
    header: ({ column }: { column: Column<LogoRow, unknown> }) => (
      <DataTableColumnHeader column={column} title='Description' />
    ),
    enableColumnFilter: true
  },
  {
    id: 'link',
    accessorFn: (row) => (row as LogoRow).link,
    header: ({ column }: { column: Column<LogoRow, unknown> }) => (
      <DataTableColumnHeader column={column} title='URL' />
    ),
    cell: ({ row }) => {
      const link = (row.original as LogoRow).link;

      if (!link) {
        return (
          <Badge
            variant='outline'
            size='sm'
            className='text-muted-foreground italic'
          >
            No link
          </Badge>
        );
      }

      return (
        <a
          href={link.startsWith('http') ? link : `https://${link}`}
          target='_blank'
          rel='noopener noreferrer'
        >
          <Badge variant='primary' size='md' appearance='light'>
            <ExternalLink /> Visit
          </Badge>
        </a>
      );
    }
  },

  {
    id: 'updatedAt',
    accessorFn: (row) => (row as LogoRow).updatedAt ?? '',
    header: 'Updated',
    cell: ({ cell }) => <RelativeTime value={cell.getValue<string>()} />
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original as LogoRow} />
  }
];
