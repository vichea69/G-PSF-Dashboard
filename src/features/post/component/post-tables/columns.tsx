'use client';
import Image from 'next/image';
import { Column, ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { IconCircleCheck, IconCircleX } from '@tabler/icons-react';
import { CellAction } from './cell-action';
import { getLocalizedText, type LocalizedText } from '@/lib/helpers';
import { type Language } from '@/context/language-context';
import { resolveApiAssetUrl } from '@/lib/asset-url';
import { TruncatedTooltipCell } from '@/components/ui/truncated-tooltip-cell';
import type { Option } from '@/types/data-table';

export type PostRow = {
  id: number;
  title: string | LocalizedText;
  slug: string;
  isFeatured?: boolean;
  coverImage?: string;
  documentThumbnail?: string;
  documents?: {
    en?: { thumbnailUrl?: string };
    km?: { thumbnailUrl?: string };
  };
  content?: unknown;
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

const FEATURED_OPTIONS: Option[] = [{ value: 'true', label: 'Featured' }];

const readString = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

const parseMaybeJson = (value: unknown): unknown => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return trimmed;

  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed;
  }
};

const IMAGE_KEYS = [
  'coverImage',
  'cover_image',
  'documentThumbnail',
  'document_thumbnail',
  'thumbnailUrl',
  'thumbnail_url',
  'imageUrl',
  'image_url',
  'image',
  'bannerImage',
  'banner_image',
  'heroImage',
  'hero_image',
  'src'
] as const;

function findImageFromUnknown(value: unknown, depth = 0): string {
  if (depth > 5 || value == null) return '';

  const parsed = parseMaybeJson(value);
  if (Array.isArray(parsed)) {
    for (const item of parsed) {
      const found = findImageFromUnknown(item, depth + 1);
      if (found) return found;
    }
    return '';
  }

  if (!parsed || typeof parsed !== 'object') return '';
  const record = parsed as Record<string, unknown>;

  const backgroundImages =
    record.backgroundImages ?? record.background_images ?? [];
  if (Array.isArray(backgroundImages)) {
    for (const item of backgroundImages) {
      const url = readString(item);
      if (url) return url;
    }
  }

  if (
    record.type === 'image' &&
    record.attrs &&
    typeof record.attrs === 'object'
  ) {
    const src = readString((record.attrs as Record<string, unknown>).src);
    if (src) return src;
  }

  for (const key of IMAGE_KEYS) {
    const url = readString(record[key]);
    if (url) return url;
  }

  for (const [key, child] of Object.entries(record)) {
    if (key === 'href' || key === 'link' || key === 'slug') continue;
    const found = findImageFromUnknown(child, depth + 1);
    if (found) return found;
  }

  return '';
}

function getPostImageSrc(row: PostRow): string {
  const coverImageUrl =
    readString(row.coverImage) ||
    readString((row as any)?.cover_image) ||
    readString((row as any)?.cover);
  const documentThumbnailUrl =
    readString(row.documentThumbnail) ||
    readString((row as any)?.document_thumbnail) ||
    readString(row.documents?.en?.thumbnailUrl) ||
    readString((row as any)?.documents?.en?.thumbnail_url) ||
    readString(row.documents?.km?.thumbnailUrl) ||
    readString((row as any)?.documents?.km?.thumbnail_url);
  const blockImageUrl =
    findImageFromUnknown(row.content) ||
    findImageFromUnknown((row as any)?.heroBanner) ||
    findImageFromUnknown((row as any)?.hero_banner) ||
    findImageFromUnknown((row as any)?.blocks);
  const firstImageUrl = row.images?.[0]?.url ?? '';
  const legacyImageUrl =
    readString((row as any)?.imageUrl) ||
    readString((row as any)?.image) ||
    readString((row as any)?.thumbnail);
  const raw =
    coverImageUrl ||
    documentThumbnailUrl ||
    blockImageUrl ||
    firstImageUrl ||
    legacyImageUrl ||
    '';

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

export const getPostColumns = (
  language: Language,
  pageOptions: Option[],
  sectionOptions: Option[],
  categoryOptions: Option[]
): ColumnDef<PostRow>[] => [
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
    cell: ({ cell }) => (
      <TruncatedTooltipCell
        text={String(cell.getValue() ?? '')}
        widthClassName='block w-[8rem] truncate sm:w-[11rem] lg:w-[16rem]'
        tooltipClassName='max-w-[24rem] break-words'
        minLength={12}
      />
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
    header: 'Category',
    cell: ({ cell }) => (
      <TruncatedTooltipCell
        text={String(cell.getValue() ?? '')}
        widthClassName='block w-[7rem] truncate sm:w-[9rem] lg:w-[12rem]'
        tooltipClassName='max-w-[20rem] break-words'
        minLength={10}
      />
    ),
    enableColumnFilter: true,
    meta: categoryOptions.length
      ? {
          label: 'Category',
          variant: 'select',
          options: categoryOptions
        }
      : undefined
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
    cell: ({ cell }) => (
      <TruncatedTooltipCell
        text={String(cell.getValue() ?? '')}
        widthClassName='block w-[7rem] truncate sm:w-[9rem] lg:w-[12rem]'
        tooltipClassName='max-w-[20rem] break-all'
        minLength={10}
      />
    ),
    enableColumnFilter: true,
    meta: sectionOptions.length
      ? {
          label: 'Section',
          variant: 'select',
          options: sectionOptions
        }
      : undefined
  },
  {
    id: 'page',
    accessorFn: (row) =>
      getLocalizedText(row.page?.title ?? '', language) ?? row.page?.slug ?? '',
    header: 'Page',
    cell: ({ cell }) => (
      <TruncatedTooltipCell
        text={String(cell.getValue() ?? '')}
        widthClassName='block w-[7rem] truncate sm:w-[9rem] lg:w-[12rem]'
        tooltipClassName='max-w-[20rem] break-all'
        minLength={12}
      />
    ),
    enableColumnFilter: true,
    meta: pageOptions.length
      ? {
          label: 'Page',
          variant: 'select',
          options: pageOptions
        }
      : undefined
  },
  {
    id: 'featured',
    accessorFn: (row) => (row.isFeatured ? 'true' : ''),
    header: 'Featured',
    cell: () => null,
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: true,
    meta: {
      label: 'Featured',
      variant: 'select',
      options: FEATURED_OPTIONS
    }
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
