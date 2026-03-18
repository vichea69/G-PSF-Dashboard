import type { Table } from '@tanstack/react-table';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useTranslate } from '@/hooks/use-translate';
import { cn } from '@/lib/utils';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';

interface DataTablePaginationProps<TData> extends React.ComponentProps<'div'> {
  table: Table<TData>;
  pageSizeOptions?: number[];
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 40, 50],
  className,
  ...props
}: DataTablePaginationProps<TData>) {
  const { t } = useTranslate();

  return (
    <div
      className={cn(
        'flex w-full flex-col-reverse items-center justify-between gap-4 overflow-auto p-1 sm:flex-row sm:gap-8',
        className
      )}
      {...props}
    >
      <div className='text-muted-foreground flex-1 text-sm whitespace-nowrap'>
        {table.getFilteredSelectedRowModel().rows.length > 0 ? (
          <>
            {table.getFilteredSelectedRowModel().rows.length} {t('table.of')}{' '}
            {table.getFilteredRowModel().rows.length}{' '}
            {t('table.selectedRowsSuffix')}
          </>
        ) : (
          <>
            {table.getFilteredRowModel().rows.length}{' '}
            {t('table.totalRowsSuffix')}
          </>
        )}
      </div>
      <div className='flex flex-col-reverse items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8'>
        <div className='flex items-center space-x-2'>
          <p className='text-sm font-medium whitespace-nowrap'>
            {t('table.rowsPerPage')}
          </p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className='h-8 w-[4.5rem] [&[data-size]]:h-8'>
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side='top'>
              {pageSizeOptions.map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='flex items-center justify-center text-sm font-medium'>
          {t('table.page')} {table.getState().pagination.pageIndex + 1}{' '}
          {t('table.of')} {table.getPageCount()}
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            aria-label={t('table.goToFirstPage')}
            variant='outline'
            size='icon'
            className='hidden size-8 lg:flex'
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft />
          </Button>
          <Button
            aria-label={t('table.goToPreviousPage')}
            variant='outline'
            size='icon'
            className='size-8'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            aria-label={t('table.goToNextPage')}
            variant='outline'
            size='icon'
            className='size-8'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRightIcon />
          </Button>
          <Button
            aria-label={t('table.goToLastPage')}
            variant='outline'
            size='icon'
            className='hidden size-8 lg:flex'
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
