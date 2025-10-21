import PageContainer from '@/components/layout/page-container';
import { PermissionManager } from '@/features/role/components/edit-role/PermissionManager';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';

const editRole = () => {
  return (
    <PageContainer>
      <div className='flex w-full flex-col gap-6'>
        <Heading
          title='Edit Role'
          description='Adjust permissions and update role details.'
        />
        <Separator />
        <PermissionManager />
      </div>
    </PageContainer>
  );
};

export default editRole;
