'use client';
import { Column, ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { RelativeTime } from '@/components/ui/relative-time';
import {
  getInitials,
  getLocalizedText,
  limitWords,
  type LocalizedText
} from '@/lib/helpers';
import { type Language } from '@/context/language-context';
import { TestimonialCellAction } from './cell-action';

export type TestimonialRow = {
  id: number | string;
  title?: LocalizedText;
  quote?: LocalizedText;
  authorName?: LocalizedText;
  authorRole?: LocalizedText;
  company?: string;
  rating?: number | string;
  avatarUrl?: string;
  status?: 'published' | 'draft' | string;
  orderIndex?: number;
  createdAt?: string;
  updatedAt?: string;
};

const getStatusBadge = (status?: string) => {
  const normalized = status?.toLowerCase?.() ?? 'draft';
  const isPublished = normalized === 'published';
  const isDraft = normalized === 'draft';

  const label = isPublished
    ? 'Published'
    : isDraft
      ? 'Draft'
      : (status ?? 'N/A');
  const className = isPublished
    ? 'border-emerald-200 bg-emerald-100 text-emerald-700'
    : isDraft
      ? 'border-amber-200 bg-amber-100 text-amber-700'
      : 'border-slate-200 bg-slate-100 text-slate-700';

  return (
    <Badge variant='outline' className={className}>
      {label}
    </Badge>
  );
};

const clampRating = (value: unknown) => {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return 0;
  return Math.min(5, Math.max(0, numberValue));
};

const highlightMatch = (value: string, term?: string) => {
  const trimmed = (term ?? '').trim();
  if (!trimmed) return <span>{value}</span>;
  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapeRegExp(trimmed)})`, 'ig');
  const parts = value.split(regex);
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <span key={index} className=''>
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
};

const getAvatarSrc = (row: TestimonialRow) => {
  const raw = row as TestimonialRow & {
    avatar?: string;
    image?: string;
    imageUrl?: string;
  };
  return raw.avatarUrl || raw.avatar || raw.image || raw.imageUrl || '';
};

export const getTestimonialColumns = (
  language: Language
): ColumnDef<TestimonialRow>[] => [
  {
    id: 'avatar',
    accessorKey: 'avatarUrl',
    header: 'AVATAR',
    cell: ({ row }) => {
      const name = getLocalizedText(row.original.authorName, language);
      const initials = getInitials(name, 2) || 'NA';
      const src = getAvatarSrc(row.original);
      return (
        <Avatar className='h-10 w-10 rounded-lg'>
          <AvatarImage src={src} alt={name || 'Author'} />
          <AvatarFallback className='rounded-lg'>{initials}</AvatarFallback>
        </Avatar>
      );
    }
  },
  {
    id: 'title',
    accessorFn: (row) => getLocalizedText(row.title ?? '', language),
    header: ({ column }: { column: Column<TestimonialRow, unknown> }) => (
      <DataTableColumnHeader column={column} title='Title' />
    ),
    cell: ({ cell, row }) => {
      const value = (cell.getValue<string>() ?? '').toString() || 'Untitled';
      const quote = getLocalizedText(row.original.quote ?? '', language);
      const raw = cell.column.getFilterValue() as string | undefined;
      return (
        <div className='space-y-1'>
          <div className='leading-snug font-medium'>
            {highlightMatch(value, raw)}
          </div>
          {quote ? (
            <div className='text-muted-foreground line-clamp-2 max-w-[360px] text-xs'>
              “{limitWords(quote)}”
            </div>
          ) : null}
        </div>
      );
    },
    meta: {
      label: 'Title',
      placeholder: 'Search title...',
      variant: 'text'
    }
  },
  {
    id: 'author',
    accessorFn: (row) => getLocalizedText(row.authorName ?? '', language),
    header: ({ column }: { column: Column<TestimonialRow, unknown> }) => (
      <DataTableColumnHeader column={column} title='Author' />
    ),
    cell: ({ row, cell }) => {
      const name = (cell.getValue<string>() ?? '').toString();
      const role = getLocalizedText(row.original.authorRole ?? '', language);
      const company = (row.original.company ?? '').toString();
      const raw = cell.column.getFilterValue() as string | undefined;
      const subtitle = [role, company].filter(Boolean).join(' • ');

      return (
        <div className='space-y-1'>
          <div className='leading-none font-medium'>
            {highlightMatch(name || 'Unknown', raw)}
          </div>
          {subtitle ? (
            <div className='text-muted-foreground text-xs'>
              {limitWords(subtitle)}
            </div>
          ) : null}
        </div>
      );
    }
  },
  {
    accessorKey: 'rating',
    header: 'Rating',
    cell: ({ cell }) => {
      const rating = clampRating(cell.getValue<number>());
      if (!rating) {
        return <span className='text-muted-foreground'>-</span>;
      }
      const display = Number.isInteger(rating)
        ? rating.toString()
        : rating.toFixed(1);
      return (
        <div className='flex items-center gap-1'>
          <div className='flex items-center gap-0.5'>
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={`h-3.5 w-3.5 ${
                  index < Math.round(rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-muted-foreground/30'
                }`}
              />
            ))}
          </div>
          <span className='text-muted-foreground text-xs'>{display}/5</span>
        </div>
      );
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ cell }) => getStatusBadge(cell.getValue<string>())
  },
  {
    accessorKey: 'orderIndex',
    header: 'Order'
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated',
    cell: ({ cell }) => <RelativeTime value={cell.getValue<string>()} />
  },
  {
    id: 'actions',
    cell: ({ row }) => <TestimonialCellAction data={row.original} />
  }
];
