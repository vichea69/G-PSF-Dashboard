import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import ContactsViewPage from '@/features/contact/components/contacts-page';
import { Suspense } from 'react';

export const metadata = { title: 'Dashboard: Contacts' };

export default function Page() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading title='Contacts' description='Manage contact messages' />
        </div>

        <Separator />

        <Suspense fallback={null}>
          <ContactsViewPage />
        </Suspense>
      </div>
    </PageContainer>
  );
}
