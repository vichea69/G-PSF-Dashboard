'use client';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  type ColumnFiltersState,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  functionalUpdate
} from '@tanstack/react-table';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { usePermissions } from '@/context/permission-context';
import { useTranslate } from '@/hooks/use-translate';
import { getPostColumns, type PostRow } from './columns';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';

type PostTableListProps = {
  data: PostRow[];
  page: number;
  pageSize: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  pageOptions: Array<{ value: string; label: string }>;
  selectedPageId: string;
  onPageFilterChange: (value: string) => void;
  sectionOptions: Array<{ value: string; label: string }>;
  selectedSectionId: string;
  onSectionFilterChange: (value: string) => void;
  categoryOptions: Array<{ value: string; label: string }>;
  selectedCategoryId: string;
  onCategoryFilterChange: (value: string) => void;
  selectedFeatured: string;
  onFeaturedFilterChange: (value: string) => void;
};

export function PostTableList({
  data,
  page,
  pageSize,
  pageCount,
  onPageChange,
  onPageSizeChange,
  searchQuery,
  onSearchChange,
  pageOptions,
  selectedPageId,
  onPageFilterChange,
  sectionOptions,
  selectedSectionId,
  onSectionFilterChange,
  categoryOptions,
  selectedCategoryId,
  onCategoryFilterChange,
  selectedFeatured,
  onFeaturedFilterChange
}: PostTableListProps) {
  const router = useRouter();
  // Read the shared permission context once, then hide actions the user should not see.
  const { can } = usePermissions();
  const { language, t } = useTranslate();
  const canUpdatePost = can(
    adminRoutePermissions.posts.update.resource,
    adminRoutePermissions.posts.update.action
  );
  const columns = useMemo(
    () =>
      getPostColumns(language, pageOptions, sectionOptions, categoryOptions, t),
    [language, pageOptions, sectionOptions, categoryOptions, t]
  );
  const columnFilters = useMemo<ColumnFiltersState>(() => {
    const filters: ColumnFiltersState = [];

    if (searchQuery.trim()) {
      filters.push({ id: 'title', value: searchQuery });
    }

    if (selectedPageId.trim()) {
      filters.push({ id: 'page', value: [selectedPageId] });
    }

    if (selectedSectionId.trim()) {
      filters.push({ id: 'section', value: [selectedSectionId] });
    }

    if (selectedCategoryId.trim()) {
      filters.push({ id: 'category', value: [selectedCategoryId] });
    }

    if (selectedFeatured.trim()) {
      filters.push({ id: 'featured', value: [selectedFeatured] });
    }

    return filters;
  }, [
    searchQuery,
    selectedPageId,
    selectedSectionId,
    selectedCategoryId,
    selectedFeatured
  ]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualFiltering: true,
    manualPagination: true,
    pageCount,
    initialState: {
      columnVisibility: {
        featured: false
      }
    },
    state: {
      pagination: {
        pageIndex: Math.max(0, page - 1),
        pageSize
      },
      columnFilters
    },
    onColumnFiltersChange: (updater) => {
      const nextFilters = functionalUpdate(updater, columnFilters);
      const titleFilter = nextFilters.find((filter) => filter.id === 'title');
      const pageFilter = nextFilters.find((filter) => filter.id === 'page');
      const sectionFilter = nextFilters.find(
        (filter) => filter.id === 'section'
      );
      const categoryFilter = nextFilters.find(
        (filter) => filter.id === 'category'
      );
      const featuredFilter = nextFilters.find(
        (filter) => filter.id === 'featured'
      );
      const nextSearchQuery = String(titleFilter?.value ?? '');
      const nextPageId = Array.isArray(pageFilter?.value)
        ? String(pageFilter?.value[0] ?? '')
        : String(pageFilter?.value ?? '');
      const nextSectionId = Array.isArray(sectionFilter?.value)
        ? String(sectionFilter?.value[0] ?? '')
        : String(sectionFilter?.value ?? '');
      const nextCategoryId = Array.isArray(categoryFilter?.value)
        ? String(categoryFilter?.value[0] ?? '')
        : String(categoryFilter?.value ?? '');
      const nextFeatured = Array.isArray(featuredFilter?.value)
        ? String(featuredFilter?.value[0] ?? '')
        : String(featuredFilter?.value ?? '');

      if (nextSearchQuery !== searchQuery) {
        onSearchChange(nextSearchQuery);
      }

      if (nextPageId !== selectedPageId) {
        onPageFilterChange(nextPageId);
      }

      if (nextSectionId !== selectedSectionId) {
        onSectionFilterChange(nextSectionId);
      }

      if (nextCategoryId !== selectedCategoryId) {
        onCategoryFilterChange(nextCategoryId);
      }

      if (nextFeatured !== selectedFeatured) {
        onFeaturedFilterChange(nextFeatured);
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
    <DataTable
      table={table}
      onRowClick={(row) => {
        if (!canUpdatePost) return;
        const id = row.original?.id;
        if (id !== undefined && id !== null) {
          router.push(`/admin/post/${id}`);
        }
      }}
    >
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
