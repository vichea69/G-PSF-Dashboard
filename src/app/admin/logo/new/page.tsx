import FormCardSkeleton from '@/components/form-card-skeleton';
import PageContainer from '@/components/layout/page-container';
import { Suspense } from 'react';
import LogoViewPage from '@/features/logo/components/logo-view-page';

export const metadata = {
  title: 'New Logo'
};

export default function Page() {
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Suspense fallback={<FormCardSkeleton />}>
          <LogoViewPage logoId={'new'} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
