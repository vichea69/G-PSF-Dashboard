'use client';
import Image from 'next/image';
import { ColumnDef } from '@tanstack/react-table';
import { RelativeTime } from '@/components/ui/relative-time';
import { CellAction } from './cell-action';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { LogoType } from '@/features/logo/type/logo-type';
import { resolveApiAssetUrl } from '@/lib/asset-url';

type TranslateFn = (key: string) => string;

export function getLogoColumns(t: TranslateFn): ColumnDef<LogoType>[] {
  // Build the translated columns in one place so the table stays easy to scan.
  return [
    {
      accessorKey: 'id',
      header: t('logo.columns.id')
    },
    {
      header: t('logo.columns.logo'),
      accessorKey: 'url',
      cell: ({ row }) => {
        const src = resolveApiAssetUrl(row.original?.url);
        const title = row.original?.title || t('logo.columns.logo');

        if (!src) {
          return <div className='relative h-16 w-16' />;
        }

        return (
          <div className='relative h-16 w-16'>
            <Image
              src={src}
              alt={title}
              fill
              sizes='64px'
              unoptimized
              className='rounded-md object-contain'
            />
          </div>
        );
      }
    },
    {
      accessorKey: 'title',
      header: t('logo.columns.name'),
      enableColumnFilter: true,
      meta: {
        label: t('logo.filters.companyName'),
        placeholder: t('logo.filters.searchCompanyName'),
        variant: 'text'
      }
    },
    {
      accessorKey: 'description',
      header: t('logo.columns.description')
    },
    {
      accessorKey: 'link',
      header: t('logo.columns.link'),
      cell: ({ row }) => {
        const link = (row.original as LogoType).link;

        if (!link) {
          return (
            <Badge
              variant='outline'
              size='sm'
              className='text-muted-foreground italic'
            >
              {t('logo.state.noLink')}
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
              <ExternalLink /> {t('logo.actions.visit')}
            </Badge>
          </a>
        );
      }
    },
    {
      id: 'updatedAt',
      accessorFn: (row) => (row as LogoType).updatedAt ?? '',
      header: t('logo.columns.updated'),
      cell: ({ cell }) => <RelativeTime value={cell.getValue<string>()} />
    },
    {
      id: 'actions',
      header: t('logo.columns.actions'),
      cell: ({ row }) => <CellAction data={row.original as LogoType} />
    }
  ];
}
