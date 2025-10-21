import PageContainer from '@/components/layout/page-container';
import AddRolePage from '@/features/role/components/add-role/page';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';

export default function Page() {
  return (
    <PageContainer>
      <div className='flex w-full flex-col gap-6'>
        <Heading
          title='Create Role'
          description='Define permissions and assign access for a new role.'
        />
        <Separator />
        <AddRolePage />
      </div>
    </PageContainer>
  );
}
