'use client';
import { useMemo, useState } from 'react';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { useLanguage } from '@/context/language-context';
import { usePost } from '@/hooks/use-post';
import { getLocalizedText } from '@/lib/helpers';
import { PostTableList } from './post-tables';

export default function PostsListPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading } = usePost({ page, pageSize });
  const { language } = useLanguage();

  const { list, currentPage, currentPageSize, pageCount } = useMemo(() => {
    const payload = data as any;
    const raw = payload?.data ?? payload;
    const possibleItems = Array.isArray(raw)
      ? raw
      : (raw?.items ?? raw?.rows ?? raw?.posts ?? raw?.data ?? []);
    const items = Array.isArray(possibleItems) ? possibleItems : [];
    const total =
      typeof payload?.total === 'number' ? payload.total : items.length;
    const normalizedPage =
      typeof payload?.page === 'number' ? payload.page : page;
    const normalizedPageSize =
      typeof payload?.pageSize === 'number' ? payload.pageSize : pageSize;

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
    />
  );
}
