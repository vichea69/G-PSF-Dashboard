'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { IconPlus } from '@tabler/icons-react';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useTranslate } from '@/hooks/use-translate';
import { cn } from '@/lib/utils';
import WorkingGroupsListPage from './working-groups-list';

type WorkingGroupListScreenProps = {
  canCreateWorkingGroup: boolean;
};

export default function WorkingGroupListScreen({
  canCreateWorkingGroup
}: WorkingGroupListScreenProps) {
  const { t } = useTranslate();

  useEffect(() => {
    document.title = t('workingGroup.title');
  }, [t]);

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      {/* Keep the page heading in a client component so it follows the selected language. */}
      <div className='flex items-start justify-between'>
        <Heading
          title={t('workingGroup.title')}
          description={t('workingGroup.description')}
        />
        {canCreateWorkingGroup ? (
          <Link
            href='/admin/working-group/new'
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <IconPlus className='mr-2 h-4 w-4' /> {t('workingGroup.addNew')}
          </Link>
        ) : null}
      </div>
      <Separator />
      <WorkingGroupsListPage />
    </div>
  );
}
