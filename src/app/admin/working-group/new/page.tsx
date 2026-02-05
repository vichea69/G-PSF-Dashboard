import { Suspense } from 'react';
import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import WorkingGroupForm from '@/features/working-group/component/working-group-form';

export const metadata = {
  title: 'Dashboard: New Working Group'
};

export default function NewWorkingGroupPage() {
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Heading
          title='Create Working Group'
          description='Set localized title, description, page and status.'
        />
        <Separator />
        <Suspense fallback={<FormCardSkeleton />}>
          <WorkingGroupForm />
        </Suspense>
      </div>
    </PageContainer>
  );
}
