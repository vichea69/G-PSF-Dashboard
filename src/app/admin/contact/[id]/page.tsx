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
  const { id } = await params; // Next 15: params is Promise
  const payload = await getContactById(id);
  const contact = (payload as any)?.data ?? payload;

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Heading
          title='View / Edit Contact'
          description='Review the contact message.'
        />
        <Separator />
        <ContactForm initialData={contact} />
      </div>
    </PageContainer>
  );
}
