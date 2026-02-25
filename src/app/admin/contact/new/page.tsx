import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import ContactForm from '@/features/contact/components/contact-form';

export const metadata = { title: 'Dashboard: New Contact' };

export default function Page() {
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Heading
          title='Create Contact'
          description='Add a new contact record.'
        />
        <Separator />
        <ContactForm initialData={null} />
      </div>
    </PageContainer>
  );
}
