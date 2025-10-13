import PageContainer from '@/components/layout/page-container';
import NewRole from '@/features/role/components/addRole';

export default function Page() {
  return (
    <PageContainer>
      <div className='flex w-full flex-col gap-6'>
        <NewRole />
      </div>
    </PageContainer>
  );
}
