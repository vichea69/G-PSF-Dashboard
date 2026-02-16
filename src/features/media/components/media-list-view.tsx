'use client';

import { useMemo } from 'react';
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Eye,
  Trash2,
  FileImage,
  FileVideo,
  FileText,
  File
} from 'lucide-react';
import {
  formatFileSize,
  formatDate,
  type MediaFile
} from '@/features/media/types/media-type';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { DataTablePagination } from '@/components/ui/table/data-table-pagination';

interface MediaListViewProps {
  files: MediaFile[];
  selectedFiles: Set<string>;
  onToggleSelection: (fileId: string) => void;
  onToggleAll?: (checked: boolean) => void;
  onPreview: (file: MediaFile) => void;
  onDelete: (file: MediaFile) => void;
  deletingIds?: Set<string>;
  page: number;
  pageSize: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function MediaListView({
  files,
  selectedFiles,
  onToggleSelection,
  onToggleAll,
  onPreview,
  onDelete,
  deletingIds,
  page,
  pageSize,
  pageCount,
  onPageChange,
  onPageSizeChange
}: MediaListViewProps) {
  const allSelected =
    files.length > 0 && files.every((file) => selectedFiles.has(file.id));
  const someSelected =
    files.some((file) => selectedFiles.has(file.id)) && !allSelected;
  const getFileIcon = (type: MediaFile['type']) => {
    switch (type) {
      case 'image':
        return <FileImage className='text-muted-foreground h-5 w-5' />;
      case 'video':
        return <FileVideo className='text-muted-foreground h-5 w-5' />;
      case 'pdf':
      case 'document':
        return <FileText className='text-muted-foreground h-5 w-5' />;
      default:
        return <File className='text-muted-foreground h-5 w-5' />;
    }
  };

  const getTypeBadge = (type: MediaFile['type']) => {
    switch (type) {
      case 'image':
        return { variant: 'info' as const, label: 'Image' };
      case 'video':
        return { variant: 'success' as const, label: 'Video' };
      case 'pdf':
        return { variant: 'warning' as const, label: 'PDF' };
      case 'document':
      default:
        return { variant: 'secondary' as const, label: 'Document' };
    }
  };

  const columns = useMemo<ColumnDef<MediaFile>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <Checkbox
            checked={someSelected ? 'indeterminate' : allSelected}
            onCheckedChange={(value) =>
              onToggleAll?.(value === true || value === 'indeterminate')
            }
            disabled={files.length === 0}
          />
        ),
        cell: ({ row }) => {
          const file = row.original;
          return (
            <Checkbox
              checked={selectedFiles.has(file.id)}
              onCheckedChange={() => onToggleSelection(file.id)}
            />
          );
        }
      },
      {
        id: 'preview',
        header: 'Preview',
        cell: ({ row }) => {
          const file = row.original;
          const canShowThumbnail =
            (file.type === 'image' || file.type === 'pdf') &&
            Boolean(file.thumbnail);
          return (
            <div className='bg-muted relative h-15 w-15 overflow-hidden rounded'>
              {canShowThumbnail ? (
                <Image
                  src={file.thumbnail || '/placeholder.svg'}
                  alt={file.name}
                  fill
                  className='object-cover'
                  unoptimized
                />
              ) : (
                <div className='flex h-full items-center justify-center'>
                  {getFileIcon(file.type)}
                </div>
              )}
            </div>
          );
        }
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div className='text-foreground truncate text-sm font-medium'>
            {row.original.name}
          </div>
        )
      },
      {
        id: 'type',
        header: 'Type',
        cell: ({ row }) => {
          const badge = getTypeBadge(row.original.type);
          return (
            <Badge
              variant={badge.variant}
              appearance='light'
              size='sm'
              className='font-medium'
            >
              {badge.label}
            </Badge>
          );
        }
      },
      {
        id: 'size',
        header: 'Size',
        cell: ({ row }) => (
          <div className='text-muted-foreground text-sm'>
            {formatFileSize(row.original.size)}
          </div>
        )
      },
      {
        id: 'date',
        header: 'Date',
        cell: ({ row }) => (
          <div className='text-muted-foreground text-sm'>
            {formatDate(row.original.uploadedAt)}
          </div>
        )
      },
      {
        id: 'actions',
        header: () => <div className='text-right'>Actions</div>,
        cell: ({ row }) => {
          const file = row.original;
          return (
            <div className='flex justify-end gap-2'>
              <Button size='sm' variant='ghost' onClick={() => onPreview(file)}>
                <Eye className='h-4 w-4' />
              </Button>
              <Button
                size='sm'
                variant='ghost'
                disabled={deletingIds?.has(file.id)}
                onClick={() => onDelete(file)}
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>
          );
        }
      }
    ],
    [
      allSelected,
      deletingIds,
      files.length,
      onDelete,
      onPreview,
      onToggleAll,
      onToggleSelection,
      selectedFiles,
      someSelected
    ]
  );

  const table = useReactTable({
    data: files,
    columns,
    getCoreRowModel: getCoreRowModel(),
    pageCount,
    manualPagination: true,
    state: {
      pagination: {
        pageIndex: Math.max(0, page - 1),
        pageSize
      }
    },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === 'function'
          ? updater({
              pageIndex: Math.max(0, page - 1),
              pageSize
            })
          : updater;

      const nextPage = next.pageIndex + 1;
      const nextSize = next.pageSize;

      if (nextSize !== pageSize) {
        onPageSizeChange(nextSize);
        onPageChange(1);
        return;
      }

      if (nextPage !== page) {
        onPageChange(nextPage);
      }
    }
  });

  return (
    <div className='p-6'>
      <div className='border-border bg-card overflow-hidden rounded-lg border'>
        <Table>
          <TableHeader className='bg-muted/50'>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='mt-4'>
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
