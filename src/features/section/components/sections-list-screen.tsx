'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { IconPlus } from '@tabler/icons-react';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useTranslate } from '@/hooks/use-translate';
import { cn } from '@/lib/utils';
import SectionsListPage from './sections-list';

type SectionsListScreenProps = {
  canCreateSection: boolean;
};

export default function SectionsListScreen({
  canCreateSection
}: SectionsListScreenProps) {
  const { t } = useTranslate();

  useEffect(() => {
    document.title = t('section.title');
  }, [t]);

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      {/* Keep the list page heading in one client component so it follows the selected language. */}
      <div className='flex items-start justify-between'>
        <Heading
          title={t('section.title')}
          description={t('section.description')}
        />
        {canCreateSection ? (
          <Link
            href='/admin/section/new'
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <IconPlus className='mr-2 h-4 w-4' /> {t('section.addNew')}
          </Link>
        ) : null}
      </div>
      <Separator />
      <SectionsListPage />
    </div>
  );
}
