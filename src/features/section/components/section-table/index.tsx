'use client';
import { useMemo } from 'react';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useLanguage } from '@/context/language-context';
import { getLocalizedText } from '@/lib/helpers';
import { extractPageRows, usePage } from '@/hooks/use-page';
import { getSectionColumns, type SectionRow } from './culumns';

export function SectionTableList({ data }: { data: SectionRow[] }) {
  const { language } = useLanguage();
  const { data: pagesData } = usePage();
  const tableData = useMemo(() => data.slice(), [data]);
  const pageOptions = useMemo(() => {
    const pages = extractPageRows(pagesData);

    return pages
      .map((page) => {
        const slug = String(page?.slug ?? '').trim();
        if (!slug) return null;

        return {
          value: slug,
          label: getLocalizedText(page?.title, language) || `/${slug}`
        };
      })
      .filter(
        (
          option
        ): option is {
          value: string;
          label: string;
        } => Boolean(option?.value)
      );
  }, [language, pagesData]);

  const columns = useMemo(
    () => getSectionColumns(language, pageOptions),
    [language, pageOptions]
  );
  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  return (
    <DataTable table={table}>
      <div className='flex items-center justify-between'>
        <DataTableToolbar table={table} />
      </div>
    </DataTable>
  );
}
