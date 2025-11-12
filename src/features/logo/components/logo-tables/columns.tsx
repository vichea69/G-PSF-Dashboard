'use client';
import Image from 'next/image';
import { ColumnDef } from '@tanstack/react-table';
import { RelativeTime } from '@/components/ui/relative-time';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { LogoType } from '@/features/logo/type/logo-type';
import * as React from 'react';

export const logoColumns: ColumnDef<LogoType>[] = [
  {
    accessorKey: 'id',
    header: 'ID'
  },
  {
    header: 'Logo',
    accessorKey: 'url',
    cell: ({ row }) => {
      const { url: src, title = 'logo' } = row.original;
      return (
        <div className='relative h-16 w-16'>
          <Image
            src={src}
            alt={title}
            fill
            className='rounded-md object-contain'
          />
        </div>
      );
    }
  },
  {
    accessorKey: 'title',
    header: 'Name',
    meta: {
      label: 'Company Name',
      placeholder: 'Search company name...',
      variant: 'text'
    }
  },
  {
    accessorKey: 'description',
    header: 'Description'
  },
  {
    accessorKey: 'link',
    header: 'Link',
    cell: ({ row }) => {
      const link = (row.original as LogoType).link;

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
    accessorFn: (row) => (row as LogoType).updatedAt ?? '',
    header: 'Updated',
    cell: ({ cell }) => <RelativeTime value={cell.getValue<string>()} />
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original as LogoType} />
  }
];
