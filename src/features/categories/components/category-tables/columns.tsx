'use client';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Column, ColumnDef } from '@tanstack/react-table';
import { CategoryCellAction } from './cell-action';
import { RelativeTime } from '@/components/ui/relative-time';
import { Badge } from '@/components/ui/badge';
import { TruncatedTooltipCell } from '@/components/ui/truncated-tooltip-cell';

export type CategoryRow = {
  id: number;
  name: string;
  description?: string;
  relation?: {
    totalPosts?: number;
    totalPages?: number;
    totalSections?: number;
    pages?: unknown[];
    sections?: unknown[];
  };
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: number;
    displayName: string;
    email: string;
  };
};

const toCount = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.floor(parsed);
};

type TranslateFn = (key: string) => string;

// Build columns from the current language so headers and filters stay in sync.
export function getCategoryColumns(t: TranslateFn): ColumnDef<CategoryRow>[] {
  return [
    {
      accessorKey: 'id',
      header: t('category.columns.id'),
      cell: ({ cell }) => (
        <div className='w-[80px]'>{cell.getValue<number>()}</div>
      )
    },
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }: { column: Column<CategoryRow, unknown> }) => (
        <DataTableColumnHeader
          column={column}
          title={t('category.columns.name')}
        />
      ),
      cell: ({ cell }) => (
        <div>{(cell.getValue<string>() ?? '').toString()}</div>
      ),
      meta: {
        label: t('category.filters.nameLabel'),
        placeholder: t('category.filters.searchName'),
        variant: 'text'
      }
    },
    {
      accessorKey: 'description',
      header: t('category.columns.description'),
      cell: ({ cell }) => (
        <TruncatedTooltipCell
          text={String(cell.getValue<string>() ?? '')}
          widthClassName='block w-[9rem] truncate sm:w-[13rem] lg:w-[20rem]'
          tooltipClassName='max-w-[28rem] break-words'
          minLength={20}
        />
      )
    },
    {
      id: 'totalPosts',
      accessorFn: (row) => row.relation?.totalPosts ?? 0,
      header: t('category.columns.posts'),
      cell: ({ cell }) => <span>{toCount(cell.getValue<number>())}</span>
    },
    {
      id: 'Sections',
      accessorFn: (row) => row.relation?.totalSections ?? 0,
      header: t('category.columns.sections'),
      cell: ({ cell }) => <span>{toCount(cell.getValue<number>())}</span>
    },
    {
      id: 'createdBy',
      accessorFn: (row) => row.createdBy?.displayName ?? '',
      header: t('category.columns.createdBy'),
      cell: ({ cell }) => {
        const raw = (cell.getValue<string>() ?? '').trim();
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
    // {
    //   accessorKey: 'createdAt',
    //   header: 'Created At'
    // },
    {
      accessorKey: 'updatedAt',
      header: t('category.columns.updatedAt'),
      cell: ({ cell }) => <RelativeTime value={cell.getValue<string>()} />
    },

    {
      id: 'actions',
      header: t('category.columns.actions'),
      cell: ({ row }) => <CategoryCellAction data={row.original} />
    }
  ];
}
