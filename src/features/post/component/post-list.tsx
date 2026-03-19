'use client';
import { useMemo, useState } from 'react';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { useLanguage } from '@/context/language-context';
import { usePost } from '@/hooks/use-post';
import { extractCategoryRows, useCategories } from '@/hooks/use-category';
import { extractPageRows, usePage } from '@/hooks/use-page';
import { useDebounce } from '@/hooks/use-debounce';
import { getLocalizedText } from '@/lib/helpers';
import {
  extractSectionRows,
  useSection
} from '@/features/section/hook/use-section';
import { PostTableList } from './post-tables';

export default function PostsListPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPageId, setSelectedPageId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedFeatured, setSelectedFeatured] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 350);
  const { data: pagesData } = usePage();
  const { data: sectionsData } = useSection(selectedPageId);
  const { data: categoriesData } = useCategories();
  const { data, isLoading } = usePost({
    page,
    pageSize,
    q: debouncedSearchQuery,
    pageId: selectedPageId,
    sectionId: selectedSectionId,
    categoryId: selectedCategoryId,
    isFeatured: selectedFeatured
  });
  const { language } = useLanguage();
  const pageOptions = useMemo(() => {
    const rows = extractPageRows(pagesData);

    return rows
      .map((page) => {
        const id = String(page?.id ?? '').trim();
        if (!id) return null;

        return {
          value: id,
          label:
            getLocalizedText(page?.title, language) ||
            page?.slug ||
            `Page ${id}`
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
  const sectionOptions = useMemo(() => {
    const rows = extractSectionRows(sectionsData);

    return rows
      .map((section) => {
        const id = String(section?.id ?? '').trim();
        if (!id) return null;

        return {
          value: id,
          label:
            getLocalizedText(section?.title, language) ||
            section?.blockType ||
            `Section ${id}`
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
  }, [language, sectionsData]);
  const categoryOptions = useMemo(() => {
    const raw = extractCategoryRows(categoriesData);

    return raw
      .map((category) => {
        const id = String(category?.id ?? '').trim();
        if (!id) return null;

        return {
          value: id,
          label: getLocalizedText(category?.name, language) || `Category ${id}`
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
  }, [categoriesData, language]);

  const { list, currentPage, currentPageSize, pageCount } = useMemo(() => {
    const payload = data as any;
    const raw = payload?.data ?? payload ?? {};
    const possibleItems = Array.isArray(raw)
      ? raw
      : (raw?.items ??
        raw?.rows ??
        raw?.posts ??
        raw?.data ??
        raw?.data?.items ??
        []);
    const items = Array.isArray(possibleItems) ? possibleItems : [];
    const totalValue = Number(
      payload?.total ??
        raw?.total ??
        raw?.meta?.total ??
        raw?.pagination?.total ??
        raw?.data?.total
    );
    const pageValue = Number(
      payload?.page ??
        raw?.page ??
        raw?.meta?.page ??
        raw?.pagination?.page ??
        raw?.data?.page
    );
    const pageSizeValue = Number(
      payload?.pageSize ??
        payload?.limit ??
        raw?.pageSize ??
        raw?.limit ??
        raw?.meta?.pageSize ??
        raw?.meta?.limit ??
        raw?.pagination?.pageSize ??
        raw?.pagination?.limit ??
        raw?.data?.pageSize ??
        raw?.data?.limit
    );

    const total =
      Number.isFinite(totalValue) && totalValue >= 0
        ? Math.floor(totalValue)
        : items.length;
    const normalizedPage =
      Number.isFinite(pageValue) && pageValue > 0
        ? Math.floor(pageValue)
        : page;
    const normalizedPageSize =
      Number.isFinite(pageSizeValue) && pageSizeValue > 0
        ? Math.floor(pageSizeValue)
        : pageSize;

    const mappedList = items.map((item) => {
      const sectionLabel = getLocalizedText(
        item?.section?.title ?? item?.section?.name,
        language
      );

      return {
        ...item,
        title: getLocalizedText(item?.title, language),
        category: item?.category
          ? {
              ...item.category,
              name: getLocalizedText(item?.category?.name, language)
            }
          : item?.category,
        section: item?.section
          ? {
              ...item.section,
              title: sectionLabel || item?.section?.title,
              name: sectionLabel || item?.section?.name
            }
          : item?.section,
        page: item?.page
          ? {
              ...item.page,
              title: getLocalizedText(item?.page?.title, language)
            }
          : item?.page
      };
    });
    const normalizedPageCount = Math.max(
      1,
      Math.ceil(total / Math.max(1, normalizedPageSize))
    );

    return {
      list: mappedList,
      currentPage: normalizedPage,
      currentPageSize: normalizedPageSize,
      pageCount: normalizedPageCount
    };
  }, [data, language, page, pageSize]);

  if (isLoading) return <DataTableSkeleton columnCount={8} rowCount={8} />;
  return (
    <PostTableList
      data={list}
      page={currentPage}
      pageSize={currentPageSize}
      pageCount={pageCount}
      onPageChange={setPage}
      onPageSizeChange={(nextPageSize) => {
        setPageSize(nextPageSize);
        setPage(1);
      }}
      searchQuery={searchQuery}
      onSearchChange={(value) => {
        setSearchQuery(value);
        setPage(1);
      }}
      pageOptions={pageOptions}
      selectedPageId={selectedPageId}
      onPageFilterChange={(value) => {
        setSelectedPageId(value);
        setSelectedSectionId('');
        setPage(1);
      }}
      sectionOptions={sectionOptions}
      selectedSectionId={selectedSectionId}
      onSectionFilterChange={(value) => {
        setSelectedSectionId(value);
        setPage(1);
      }}
      categoryOptions={categoryOptions}
      selectedCategoryId={selectedCategoryId}
      onCategoryFilterChange={(value) => {
        setSelectedCategoryId(value);
        setPage(1);
      }}
      selectedFeatured={selectedFeatured}
      onFeaturedFilterChange={(value) => {
        setSelectedFeatured(value);
        setPage(1);
      }}
    />
  );
}
