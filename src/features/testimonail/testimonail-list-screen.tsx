'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { IconPlus } from '@tabler/icons-react';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useTranslate } from '@/hooks/use-translate';
import { cn } from '@/lib/utils';
import TestimonialPage from './testimonail-page';

type TestimonialListScreenProps = {
  canCreateTestimonial: boolean;
};

export default function TestimonialListScreen({
  canCreateTestimonial
}: TestimonialListScreenProps) {
  const { t } = useTranslate();

  useEffect(() => {
    document.title = t('testimonial.title');
  }, [t]);

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      {/* Keep the page heading in a client component so it follows the selected language. */}
      <div className='flex items-start justify-between'>
        <Heading
          title={t('testimonial.title')}
          description={t('testimonial.description')}
        />
        {canCreateTestimonial ? (
          <Link
            href='/admin/testimonial/new'
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <IconPlus className='mr-2 h-4 w-4' /> {t('testimonial.addNew')}
          </Link>
        ) : null}
      </div>
      <Separator />
      <TestimonialPage />
    </div>
  );
}
