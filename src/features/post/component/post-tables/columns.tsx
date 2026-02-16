'use client';
import Image from 'next/image';
import { Column, ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { IconCircleCheck, IconCircleX } from '@tabler/icons-react';
import { CellAction } from './cell-action';
import {
  getLocalizedText,
  limitWords,
  type LocalizedText
} from '@/lib/helpers';
import { type Language } from '@/context/language-context';
import { resolveApiAssetUrl } from '@/lib/asset-url';

export type PostRow = {
  id: number;
  title: string | LocalizedText;
  slug: string;
  coverImage?: string;
  content?: string;
  status: 'published' | 'draft' | string;
  images?: { id: number; url: string; sortOrder?: number | null }[];
  updatedAt: string;
  category?: { id: number; name: LocalizedText } | undefined;
  section?:
    | {
        id: number | string;
        title?: LocalizedText;
        name?: LocalizedText;
        slug?: string;
      }
    | undefined;
  sectionId?: number | string;
  page?: { id: number; title?: LocalizedText; slug?: string } | undefined;
};

function getPostImageSrc(row: PostRow): string {
  const coverImageUrl =
    row.coverImage ?? (row as any)?.cover_image ?? (row as any)?.cover;
  const firstImageUrl = row.images?.[0]?.url ?? '';
  const legacyImageUrl =
    (row as any)?.imageUrl ?? (row as any)?.image ?? (row as any)?.thumbnail;
  const raw = coverImageUrl || firstImageUrl || legacyImageUrl || '';

  return resolveApiAssetUrl(raw);
}

const postStatusBadge = (status: string) => {
  const normalized = status?.toLowerCase?.() ?? '';
  const isPublished = normalized === 'published';
  return (
    <Badge
      variant={isPublished ? 'success' : 'warning'}
      appearance='outline'
      className='gap-1'
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
    accessorFn: (row) => getPostImageSrc(row),
    header: 'IMAGE',
    cell: ({ row }) => {
      const original = row.original as PostRow;
      const images = Array.isArray(original?.images) ? original.images : [];
      const src = getPostImageSrc(original);

      return src ? (
        <div className='relative h-20 w-20'>
          <Image
            src={src}
            alt={row.getValue('title') as string}
            fill
            unoptimized
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
    cell: ({ cell }) => limitWords(String(cell.getValue() ?? ''), 6),
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
    header: 'Category',
    cell: ({ cell }) => limitWords(String(cell.getValue() ?? ''), 5)
  },
  {
    id: 'section',
    accessorFn: (row) => {
      const raw = row.section as
        | {
            id?: number | string;
            title?: LocalizedText;
            name?: LocalizedText;
            slug?: string;
          }
        | undefined;
      const localized = getLocalizedText(
        (raw?.title ?? raw?.name) as LocalizedText,
        language
      );
      if (localized) return localized;
      if (raw?.slug) return raw.slug;
      if (raw?.id !== undefined && raw?.id !== null) return String(raw.id);
      if (row.sectionId !== undefined && row.sectionId !== null) {
        return String(row.sectionId);
      }
      return '';
    },
    header: 'Section',
    cell: ({ cell }) => limitWords(String(cell.getValue() ?? ''), 5),
    enableColumnFilter: true,
    meta: {
      label: 'Section',
      placeholder: 'Search section...',
      variant: 'text'
    }
  },
  {
    id: 'page',
    accessorFn: (row) =>
      getLocalizedText(row.page?.title ?? '', language) ?? row.page?.slug ?? '',
    header: 'Page',
    cell: ({ cell }) => limitWords(String(cell.getValue() ?? ''), 5)
  },
  // {
  //   accessorKey: 'updatedAt',
  //   header: 'Updated'
  // },
  {
    header: 'Actions',
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
