import PageContainer from '@/components/layout/page-container';
import RolesTableSection from '@/features/role/components/role-table/page';
import { Suspense } from 'react';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';

export const metadata = {
  title: 'Role'
};
// Page that wires the layout to the permission feature.
export default function PermissionPage() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Role and Permission '
            description='Manage role and permission of user'
          />
        </div>
        <Separator />
        <Suspense fallback={null}>
          <RolesTableSection />
        </Suspense>
      </div>
    </PageContainer>
  );
}
