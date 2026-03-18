import PageContainer from '@/components/layout/page-container';
import ContactsListScreen from '@/features/contact/components/contacts-list-screen';

export const metadata = { title: 'Dashboard: Contacts' };

export default function Page() {
  return (
    <PageContainer scrollable={false}>
      <ContactsListScreen />
    </PageContainer>
  );
}
