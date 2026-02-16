'use client';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { CellAction } from './cell-action';
import { type Language } from '@/context/language-context';
import { RelativeTime } from '@/components/ui/relative-time';

type LocalizedText = Record<string, string | undefined>;
type LocalizedValue = string | LocalizedText;

const DEFAULT_LOCALE_PRIORITY = ['en', 'km'];

const createLocalePriority = (language: Language) =>
  language === 'kh' ? ['km', 'en'] : ['en', 'km'];

const resolveLocalizedValue = (
  value?: LocalizedValue,
  localePriority: string[] = DEFAULT_LOCALE_PRIORITY
) => {
  if (!value) return '';
  if (typeof value === 'string') return value;

  for (const locale of localePriority) {
    const localized = value[locale];
    if (localized) return localized;
  }
  return Object.values(value).find((entry) => Boolean(entry)) ?? '';
};

const listOtherLocales = (value?: LocalizedValue, primary?: string) => {
  if (!value || typeof value === 'string') return [];
  return Object.entries(value).filter(
    ([, text]) => Boolean(text) && text !== primary
  ) as [string, string][];
};

export type PageRow = {
  id: number;
  title?: LocalizedValue;
  slug: string;
  status: 'published' | 'draft' | string;
  content?: string;
  publishedAt?: string;
  updatedAt?: string;
  createdAt?: string;
  sectionCount?: number;
  authorId?: {
    id: number;
    displayName: string;
    email: string;
  };
  seo?: {
    metaTitle?: LocalizedValue;
    metaDescription?: LocalizedValue;
  };
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
export const getPageColumns = (language: Language): ColumnDef<PageRow>[] => {
  const localePriority = createLocalePriority(language);

  return [
    {
      id: 'id',
      accessorKey: 'id',
      header: ({ column }: { column: Column<PageRow, unknown> }) => (
        <DataTableColumnHeader column={column} title='ID' />
      )
    },
    {
      id: 'name',
      accessorKey: 'title',
      header: ({ column }: { column: Column<PageRow, unknown> }) => (
        <DataTableColumnHeader column={column} title='Page Title' />
      ),
      cell: ({ cell }) => {
        const rawValue = cell.getValue<LocalizedValue>();
        const value = resolveLocalizedValue(rawValue, localePriority);
        const extraLocales = listOtherLocales(rawValue, value);
        const raw = cell.column.getFilterValue() as string | undefined;
        const term = (raw ?? '').trim();
        if (!term) {
          return (
            <div>
              <div>{value}</div>
              {extraLocales.length > 0 && (
                <div className='text-muted-foreground text-xs'></div>
              )}
            </div>
          );
        }
        const escapeRegExp = (s: string) =>
          s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapeRegExp(term)})`, 'ig');
        const parts = value.split(regex);
        return (
          <div>
            <div>
              {parts.map((part, i) =>
                i % 2 === 1 ? (
                  <span key={i} className='font-semibold text-green-600'>
                    {part}
                  </span>
                ) : (
                  <span key={i}>{part}</span>
                )
              )}
            </div>
            {extraLocales.length > 0 && (
              <div className='text-muted-foreground text-xs'>
                {extraLocales.map(([locale, text]) => (
                  <span key={locale} className='mr-2 capitalize'>
                    {locale}: {text}
                  </span>
                ))}
              </div>
            )}
          </div>
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
      cell: ({ cell }) => (
        <div className='max-w-[360px] truncate'>/{cell.getValue<string>()}</div>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ cell }) => getStatusBadge(cell.getValue<string>())
    },
    {
      accessorKey: 'sectionCount',
      header: ({ column }: { column: Column<PageRow, unknown> }) => (
        <DataTableColumnHeader column={column} title='Section' />
      )
    },
    {
      accessorKey: 'publishedAt',
      header: 'Published At',
      cell: ({ cell }) => {
        const value = <RelativeTime value={cell.getValue<string>() ?? ''} />;
        return value ? (
          <span>{value}</span>
        ) : (
          <span className='text-muted-foreground italic'>Not yet publish</span>
        );
      }
    },
    {
      id: 'author',
      accessorFn: (row) => row.authorId?.displayName ?? '',
      header: 'Created By',
      cell: ({ cell }) => {
        const raw = (cell.getValue<string>() ?? '').toString();
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
