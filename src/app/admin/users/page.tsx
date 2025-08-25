import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Suspense } from 'react';
import UsersViewPage from '@/features/users/components/users-page';

export const metadata = { title: 'Dashboard: Users' };

export default async function UsersPage() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading title='Users' description='Manage users' />
        </div>
        <Separator />
        <Suspense fallback={null}>
          <UsersViewPage />
        </Suspense>
      </div>
    </PageContainer>
  );
}
