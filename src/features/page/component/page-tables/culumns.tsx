'use client';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { CellAction } from './cell-action';
import { type Language } from '@/context/language-context';
import { RelativeTime } from '@/components/ui/relative-time';
import { IconCircleCheck, IconCircleX } from '@tabler/icons-react';
import { type LocalizedText } from '@/lib/helpers';
import { TruncatedTooltipCell } from '@/components/ui/truncated-tooltip-cell';
type LocalizedValue = string | LocalizedText;
type LocaleKey = 'en' | 'km';

const DEFAULT_LOCALE_PRIORITY: LocaleKey[] = ['en', 'km'];

const createLocalePriority = (language: Language): LocaleKey[] =>
  language === 'kh' ? ['km', 'en'] : ['en', 'km'];

const resolveLocalizedValue = (
  value?: LocalizedValue,
  localePriority: LocaleKey[] = DEFAULT_LOCALE_PRIORITY
) => {
  if (!value) return '';
  if (typeof value === 'string') return value;

  for (const locale of localePriority) {
    const localized = value[locale];
    if (typeof localized === 'string' && localized) return localized;
  }
  return (
    Object.values(value).find(
      (entry): entry is string => typeof entry === 'string' && Boolean(entry)
    ) ?? ''
  );
};

const toDisplayText = (
  value: unknown,
  localePriority: LocaleKey[] = DEFAULT_LOCALE_PRIORITY
) => {
  if (value === null || value === undefined) return '';
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return String(value);
  }

  if (typeof value === 'object') {
    const localized = resolveLocalizedValue(
      value as LocalizedValue,
      localePriority
    );
    return localized ? String(localized) : '';
  }

  return '';
};

export type PageRow = {
  id: number | string;
  title?: LocalizedValue;
  slug: string | LocalizedValue;
  status: 'published' | 'draft' | string;
  content?: string;
  publishedAt?: string;
  updatedAt?: string;
  createdAt?: string;
  sectionCount?: number;
  authorId?: {
    id: number;
    displayName: string | LocalizedValue;
    email: string;
  };
  seo?: {
    metaTitle?: LocalizedValue;
    metaDescription?: LocalizedValue;
  };
};

const getStatusBadge = (status: string) => {
  const normalized = status?.toLowerCase?.() ?? '';
  const isPublished = normalized === 'published';
  const isDraft = normalized === 'draft';
  const label = isPublished ? 'Published' : isDraft ? 'Draft' : 'Unknown';
  const variant = isPublished
    ? ('success' as const)
    : isDraft
      ? ('warning' as const)
      : ('secondary' as const);

  return (
    <Badge variant={variant} appearance='outline' className='gap-1'>
      {isPublished ? (
        <IconCircleCheck className='h-3 w-3' />
      ) : (
        <IconCircleX className='h-3 w-3' />
      )}{' '}
      {label}
    </Badge>
  );
};
export const getPageColumns = (language: Language): ColumnDef<PageRow>[] => {
  const localePriority = createLocalePriority(language);

  return [
    // {
    //   id: 'id',
    //   accessorKey: 'id',
    //   header: ({ column }: { column: Column<PageRow, unknown> }) => (
    //     <DataTableColumnHeader column={column} title='ID' />
    //   ),
    //   cell: ({ row }) => {
    //     const rawId =
    //       row.original?.id ??
    //       (row.original as any)?._id ??
    //       (row.original as any)?.pageId;
    //     const idText = toDisplayText(rawId, localePriority);
    //     return <span>{idText || '-'}</span>;
    //   }
    // },
    {
      id: 'name',
      accessorFn: (row) => resolveLocalizedValue(row.title, localePriority),
      header: ({ column }: { column: Column<PageRow, unknown> }) => (
        <DataTableColumnHeader column={column} title='Page Title' />
      ),
      cell: ({ row }) => {
        const value = resolveLocalizedValue(
          row.original?.title,
          localePriority
        );
        return (
          <TruncatedTooltipCell
            text={value}
            widthClassName='block w-[8rem] truncate sm:w-[11rem] lg:w-[16rem]'
            tooltipClassName='max-w-[24rem] break-words'
            minLength={12}
          />
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
      cell: ({ cell }) => {
        const slug = toDisplayText(cell.getValue<unknown>(), localePriority);
        const fullUrl = slug ? `/${slug}` : '';
        return (
          <TruncatedTooltipCell
            text={fullUrl}
            widthClassName='block w-[7rem] truncate sm:w-[9rem] lg:w-[12rem]'
            tooltipClassName='max-w-[20rem] break-all'
            minLength={12}
          />
        );
      }
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ cell }) => {
        const status = toDisplayText(cell.getValue<unknown>(), localePriority);
        return getStatusBadge(status);
      }
    },
    {
      accessorKey: 'sectionCount',
      header: ({ column }: { column: Column<PageRow, unknown> }) => (
        <DataTableColumnHeader column={column} title='Section' />
      ),
      cell: ({ cell }) => {
        const value = toDisplayText(cell.getValue<unknown>(), localePriority);
        return <span>{value || '0'}</span>;
      }
    },
    {
      accessorKey: 'publishedAt',
      header: 'Published At',
      cell: ({ cell }) => {
        const rawValue = cell.getValue<unknown>();
        const isSupportedDateValue =
          typeof rawValue === 'string' ||
          typeof rawValue === 'number' ||
          rawValue instanceof Date;

        if (!isSupportedDateValue) {
          return (
            <span className='text-muted-foreground italic'>
              Not yet publish
            </span>
          );
        }

        return <RelativeTime value={rawValue} />;
      }
    },
    {
      id: 'author',
      accessorFn: (row) => row.authorId?.displayName ?? '',
      header: 'Created By',
      cell: ({ cell }) => {
        const raw = toDisplayText(cell.getValue<unknown>(), localePriority);
        if (!raw) {
          return <span className='text-muted-foreground'>-</span>;
        }
        const role = raw.toLowerCase();

        const variant =
          role === 'admin'
            ? ('destructive' as const)
            : role === 'editor'
              ? ('info' as const)
              : ('primary' as const);

        return (
          <Badge
            variant={variant}
            appearance='light'
            size='sm'
            className='capitalize'
          >
            {raw}
          </Badge>
        );
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => <CellAction data={row.original as any} />
    }
  ];
};
