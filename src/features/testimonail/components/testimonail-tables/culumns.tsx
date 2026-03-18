'use client';
import { Column, ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { RelativeTime } from '@/components/ui/relative-time';
import { IconCircleCheck, IconCircleX } from '@tabler/icons-react';
import {
  getInitials,
  getLocalizedText,
  limitWords,
  type LocalizedText
} from '@/lib/helpers';
import { type Language } from '@/context/language-context';
import { TestimonialCellAction } from './cell-action';
import { TruncatedTooltipCell } from '@/components/ui/truncated-tooltip-cell';

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

type TranslateFn = (key: string) => string;

const getStatusBadge = (status: string | undefined, t: TranslateFn) => {
  const normalized = status?.toLowerCase?.() ?? 'draft';
  const isPublished = normalized === 'published';
  const isDraft = normalized === 'draft';
  const label = isPublished
    ? t('testimonial.status.published')
    : isDraft
      ? t('testimonial.status.draft')
      : t('testimonial.status.unknown');
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

const clampRating = (value: unknown) => {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return 0;
  return Math.min(5, Math.max(0, numberValue));
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
  language: Language,
  t: TranslateFn
): ColumnDef<TestimonialRow>[] => [
  {
    id: 'avatar',
    accessorKey: 'avatarUrl',
    header: t('testimonial.columns.avatar'),
    cell: ({ row }) => {
      const name = getLocalizedText(row.original.authorName, language);
      const initials = getInitials(name, 2) || 'NA';
      const src = getAvatarSrc(row.original);
      return (
        <Avatar className='h-10 w-10 rounded-lg'>
          <AvatarImage src={src} alt={name || t('testimonial.state.author')} />
          <AvatarFallback className='rounded-lg'>{initials}</AvatarFallback>
        </Avatar>
      );
    }
  },
  {
    id: 'title',
    accessorFn: (row) => getLocalizedText(row.title ?? '', language),
    header: ({ column }: { column: Column<TestimonialRow, unknown> }) => (
      <DataTableColumnHeader
        column={column}
        title={t('testimonial.columns.title')}
      />
    ),
    cell: ({ cell, row }) => {
      const value =
        (cell.getValue<string>() ?? '').toString() ||
        t('testimonial.state.untitled');
      const quote = getLocalizedText(row.original.quote ?? '', language);
      return (
        <div className='space-y-1'>
          <TruncatedTooltipCell
            text={value}
            widthClassName='block w-[8rem] truncate sm:w-[11rem] lg:w-[16rem] leading-snug font-medium'
            tooltipClassName='max-w-[24rem] break-words'
            minLength={12}
            fallback={t('testimonial.state.untitled')}
          />
          {quote ? (
            <div className='text-muted-foreground line-clamp-2 max-w-[360px] text-xs'>
              “{limitWords(quote, 6)}”
            </div>
          ) : null}
        </div>
      );
    },
    meta: {
      label: t('testimonial.filters.titleLabel'),
      placeholder: t('testimonial.filters.searchTitle'),
      variant: 'text'
    }
  },
  {
    id: 'author',
    accessorFn: (row) => getLocalizedText(row.authorName ?? '', language),
    header: ({ column }: { column: Column<TestimonialRow, unknown> }) => (
      <DataTableColumnHeader
        column={column}
        title={t('testimonial.columns.author')}
      />
    ),
    cell: ({ row, cell }) => {
      const name = (cell.getValue<string>() ?? '').toString();
      const role = getLocalizedText(row.original.authorRole ?? '', language);
      const company = (row.original.company ?? '').toString();
      const subtitle = [role, company].filter(Boolean).join(' • ');

      return (
        <div className='space-y-1'>
          <TruncatedTooltipCell
            text={name || t('testimonial.state.unknown')}
            widthClassName='block w-[8rem] truncate sm:w-[11rem] lg:w-[16rem] leading-none font-medium'
            tooltipClassName='max-w-[24rem] break-words'
            minLength={12}
            fallback={t('testimonial.state.unknown')}
          />
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
    header: t('testimonial.columns.rating'),
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
          <span className='text-muted-foreground text-xs'>
            {display} {t('testimonial.state.outOfFive')}
          </span>
        </div>
      );
    }
  },
  {
    accessorKey: 'status',
    header: t('testimonial.columns.status'),
    cell: ({ cell }) => getStatusBadge(cell.getValue<string>(), t)
  },
  {
    accessorKey: 'orderIndex',
    header: t('testimonial.columns.order')
  },
  {
    accessorKey: 'updatedAt',
    header: t('testimonial.columns.updated'),
    cell: ({ cell }) => <RelativeTime value={cell.getValue<string>()} />
  },
  {
    id: 'actions',
    header: t('testimonial.columns.actions'),
    cell: ({ row }) => <TestimonialCellAction data={row.original} />
  }
];
