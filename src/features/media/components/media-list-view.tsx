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
  Folder,
  FolderOpen,
  FileImage,
  FileVideo,
  FileText,
  File
} from 'lucide-react';
import {
  formatFileSize,
  formatDate,
  type MediaFile,
  type MediaFolder
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
  folders: MediaFolder[];
  files: MediaFile[];
  selectedFolders: Set<string>;
  selectedFiles: Set<string>;
  onToggleFolderSelection: (folderId: string) => void;
  onToggleSelection: (fileId: string) => void;
  onToggleAll?: (checked: boolean) => void;
  onOpenFolder?: (folder: MediaFolder) => void;
  onPreview: (file: MediaFile) => void;
  onDelete: (file: MediaFile) => void;
  deletingIds?: Set<string>;
  page: number;
  pageSize: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

type MediaListRow =
  | {
      kind: 'folder';
      id: string;
      folder: MediaFolder;
    }
  | {
      kind: 'file';
      id: string;
      file: MediaFile;
    };

export function MediaListView({
  folders,
  files,
  selectedFolders,
  selectedFiles,
  onToggleFolderSelection,
  onToggleSelection,
  onToggleAll,
  onOpenFolder,
  onPreview,
  onDelete,
  deletingIds,
  page,
  pageSize,
  pageCount,
  onPageChange,
  onPageSizeChange
}: MediaListViewProps) {
  const rows = useMemo<MediaListRow[]>(
    () => [
      ...folders.map((folder) => ({
        kind: 'folder' as const,
        id: folder.id,
        folder
      })),
      ...files.map((file) => ({
        kind: 'file' as const,
        id: file.id,
        file
      }))
    ],
    [files, folders]
  );

  const isRowSelected = (row: MediaListRow) => {
    if (row.kind === 'folder') return selectedFolders.has(row.folder.id);
    return selectedFiles.has(row.file.id);
  };

  const allSelected =
    rows.length > 0 && rows.every((row) => isRowSelected(row));
  const someSelected = rows.some((row) => isRowSelected(row)) && !allSelected;

  const toggleAllRows = (checked: boolean) => {
    onToggleAll?.(checked);
    folders.forEach((folder) => {
      const isSelected = selectedFolders.has(folder.id);
      if (checked && !isSelected) {
        onToggleFolderSelection(folder.id);
      }
      if (!checked && isSelected) {
        onToggleFolderSelection(folder.id);
      }
    });
  };

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

  const columns = useMemo<ColumnDef<MediaListRow>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <Checkbox
            checked={someSelected ? 'indeterminate' : allSelected}
            onCheckedChange={(value) => toggleAllRows(value === true)}
            disabled={rows.length === 0}
          />
        ),
        cell: ({ row }) => {
          const mediaRow = row.original;
          if (mediaRow.kind === 'folder') {
            return (
              <Checkbox
                checked={selectedFolders.has(mediaRow.folder.id)}
                onCheckedChange={() =>
                  onToggleFolderSelection(mediaRow.folder.id)
                }
              />
            );
          }

          const file = mediaRow.file;
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
          const mediaRow = row.original;
          if (mediaRow.kind === 'folder') {
            return (
              <div className='bg-muted flex h-14 w-14 items-center justify-center overflow-hidden rounded'>
                <Folder className='h-6 w-6 text-[#f59e0b]' />
              </div>
            );
          }

          const file = mediaRow.file;
          const canShowThumbnail =
            (file.type === 'image' || file.type === 'pdf') &&
            Boolean(file.thumbnail);
          return (
            <div className='bg-muted relative h-14 w-14 overflow-hidden rounded'>
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
        id: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div className='text-foreground truncate text-sm font-medium'>
            {row.original.kind === 'folder'
              ? row.original.folder.name
              : row.original.file.name}
          </div>
        )
      },
      {
        id: 'type',
        header: 'Type',
        cell: ({ row }) => {
          const mediaRow = row.original;
          if (mediaRow.kind === 'folder') {
            return (
              <Badge
                variant='secondary'
                appearance='light'
                size='sm'
                className='font-medium'
              >
                Folder
              </Badge>
            );
          }

          const badge = getTypeBadge(mediaRow.file.type);
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
            {row.original.kind === 'folder'
              ? '-'
              : formatFileSize(row.original.file.size)}
          </div>
        )
      },
      {
        id: 'date',
        header: 'Date',
        cell: ({ row }) => (
          <div className='text-muted-foreground text-sm'>
            {formatDate(
              row.original.kind === 'folder'
                ? row.original.folder.createdAt
                : row.original.file.uploadedAt
            )}
          </div>
        )
      },
      {
        id: 'actions',
        header: () => <div className='text-right'>Actions</div>,
        cell: ({ row }) => {
          const mediaRow = row.original;
          if (mediaRow.kind === 'folder') {
            return (
              <div className='flex justify-end gap-2'>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={() => onOpenFolder?.(mediaRow.folder)}
                >
                  <FolderOpen className='h-4 w-4' />
                </Button>
              </div>
            );
          }

          const file = mediaRow.file;
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
      folders,
      onDelete,
      onOpenFolder,
      onPreview,
      onToggleAll,
      onToggleFolderSelection,
      onToggleSelection,
      rows.length,
      selectedFiles,
      selectedFolders,
      someSelected
    ]
  );

  const table = useReactTable({
    data: rows,
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
