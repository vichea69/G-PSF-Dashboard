import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import SectionForm from '@/features/section/components/section-form';

export const metadata = { title: 'Dashboard: New Section' };

export default async function Page() {
  return (
    <PageContainer scrollable={true}>
      <div className='flex-1 space-y-4'>
        <Heading
          title='Create Section'
          description='Set the section details for your page.'
        />
        <Separator />
        <SectionForm initialData={null} />
      </div>
    </PageContainer>
  );
}
