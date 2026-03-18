import PageContainer from '@/components/layout/page-container';
import ContactViewScreen from '@/features/contact/components/contact-view-screen';
import { getContactById } from '@/server/action/contact/contact';

export const metadata = { title: 'Dashboard: View Contact' };

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const contact = await getContactById(id);

  return (
    <PageContainer scrollable>
      <ContactViewScreen initialData={contact} />
    </PageContainer>
  );
}
