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
import { useTranslate } from '@/hooks/use-translate';
import { getLocalizedText } from '@/lib/helpers';
import { extractPageRows, usePage } from '@/hooks/use-page';
import { getSectionColumns, type SectionRow } from './culumns';

export function SectionTableList({ data }: { data: SectionRow[] }) {
  const { language, t } = useTranslate();
  const { data: pagesData } = usePage();
  const pageOptions = useMemo(() => {
    const pages = extractPageRows(pagesData);

    return pages
      .map((page) => {
        const pageId = Number(page?.id);
        if (!Number.isFinite(pageId) || pageId <= 0) return null;

        return {
          value: String(pageId),
          label:
            getLocalizedText(page?.title, language) ||
            String(page?.slug ?? `Page ${pageId}`)
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

  const pageLabelById = useMemo(() => {
    return new Map(pageOptions.map((option) => [option.value, option.label]));
  }, [pageOptions]);

  const tableData = useMemo(() => {
    // Normalize the page relation once so the table can display and filter reliably.
    return data.map((row) => {
      const nestedPage = (row as any)?.page;
      const rawPageId = row.pageId ?? nestedPage?.id ?? null;
      const pageId =
        rawPageId === null || rawPageId === undefined
          ? ''
          : String(rawPageId).trim();
      const pageLabel =
        getLocalizedText(nestedPage?.title ?? '', language) ||
        pageLabelById.get(pageId) ||
        String(row.pageSlug ?? nestedPage?.slug ?? '').trim();

      return {
        ...row,
        pageLabel,
        pageFilterValue: pageId
      };
    });
  }, [data, language, pageLabelById]);

  const columns = useMemo(
    () => getSectionColumns(language, pageOptions, t),
    [language, pageOptions, t]
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
