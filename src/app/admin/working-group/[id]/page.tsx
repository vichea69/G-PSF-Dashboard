import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import WorkingGroupForm from '@/features/working-group/component/working-group-form';
import { getWorkingGroupById } from '@/server/action/working-group/working-group';

export const metadata = {
  title: 'Dashboard: Edit Working Group'
};

type PageProps = { params: Promise<{ id: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  const workingGroup = await getWorkingGroupById(params.id);

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Heading
          title='Edit Working Group'
          description='Update localized title, description, page and status.'
        />
        <Separator />
        <WorkingGroupForm initialData={workingGroup} />
      </div>
    </PageContainer>
  );
}
