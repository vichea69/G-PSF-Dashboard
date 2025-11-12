import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import AddNewLogo from '@/features/logo/components/add/page';

export const metadata = {
  title: 'New Logo'
};

export default function Page() {
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Heading
          title='Create Logo'
          description='Set the company name, description, and upload a logo image.'
        />
        <Separator />
        <Suspense fallback={<FormCardSkeleton />}>
          <AddNewLogo />
        </Suspense>
      </div>
    </PageContainer>
  );
}
