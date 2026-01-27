import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import SectionForm from '@/features/section/components/section-form';
import { getSectionById } from '@/server/action/section/section';

export const metadata = { title: 'Dashboard: Edit Section' };

type PageProps = { params: Promise<{ id: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  const payload = await getSectionById(params.id);
  const section = (payload as any)?.data ?? payload;

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Heading
          title='Edit Section'
          description='Update the section details.'
        />
        <Separator />
        <SectionForm initialData={section} />
      </div>
    </PageContainer>
  );
}
