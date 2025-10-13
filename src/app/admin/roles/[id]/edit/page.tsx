import PageContainer from '@/components/layout/page-container';
import { PermissionManager } from '@/features/permission';

// export const metadata = {
//   title: 'Permissions'
// };
// Page that wires the layout to the permission feature.
const editRole = () => {
  return (
    <PageContainer>
      <div className='flex w-full flex-col gap-6'>
        <PermissionManager />
      </div>
    </PageContainer>
  );
};

export default editRole;
