'use client';
import { useEffect, useMemo } from 'react';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useCategory } from '@/hooks/use-category';
import { useTranslate } from '@/hooks/use-translate';
import { getLocalizedText } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { CategoriesTable } from './category-tables';

function extractCategoryRows(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  return [];
}

type CategoriesViewPageProps = {
  canCreateCategory: boolean;
};

export default function CategoriesViewPage({
  canCreateCategory
}: CategoriesViewPageProps) {
  const { data, isLoading } = useCategory();
  const { language, t } = useTranslate();

  // Keep the browser tab title in sync with the selected admin language.
  useEffect(() => {
    document.title = t('category.title');
  }, [t]);

  const rows = useMemo(() => {
    const rawRows = extractCategoryRows(data);
    return rawRows.map((item) => ({
      ...item,
      name: getLocalizedText(item?.name, language),
      description: getLocalizedText(item?.description, language)
    }));
  }, [data, language]);

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title={t('category.title')}
            description={t('category.description')}
          />
          {canCreateCategory ? (
            <Link
              href='/admin/category/new'
              className={cn(buttonVariants(), 'text-xs md:text-sm')}
            >
              <IconPlus className='mr-2 h-4 w-4' /> {t('category.addNew')}
            </Link>
          ) : null}
        </div>
        <Separator />
        <DataTableSkeleton columnCount={9} rowCount={8} />
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-start justify-between'>
        <Heading
          title={t('category.title')}
          description={t('category.description')}
        />
        {canCreateCategory ? (
          <Link
            href='/admin/category/new'
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <IconPlus className='mr-2 h-4 w-4' /> {t('category.addNew')}
          </Link>
        ) : null}
      </div>
      <Separator />
      <CategoriesTable data={rows as any} />
    </div>
  );
}
