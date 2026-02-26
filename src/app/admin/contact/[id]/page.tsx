import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import ContactForm from '@/features/contact/components/contact-form';
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
      <div className='flex-1 space-y-4'>
        <Heading
          title='View Message'
          description='Review the contact message.'
        />
        <Separator />
        <ContactForm initialData={contact} />
      </div>
    </PageContainer>
  );
}
