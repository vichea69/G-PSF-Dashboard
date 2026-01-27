import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import TestimonialForm from '@/features/testimonail/testimonail-form';
import { Separator } from '@/components/ui/separator';
import { Suspense } from 'react';

export default function Page() {
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Heading
          title='Create Testimonial Page'
          description='Set the page titles and content.'
        />
        <Separator />
        <Suspense fallback={<FormCardSkeleton />}>
          <TestimonialForm />
        </Suspense>
      </div>
    </PageContainer>
  );
}
