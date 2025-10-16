import PageContainer from '@/components/layout/page-container';
import AddRolePage from '@/features/role/components/add-role/page';

export default function Page() {
  return (
    <PageContainer>
      <div className='flex w-full flex-col gap-6'>
        <AddRolePage />
      </div>
    </PageContainer>
  );
}
