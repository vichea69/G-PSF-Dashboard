import PageContainer from '@/components/layout/page-container';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import SectionForm from '@/features/section/components/section-form';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';

export const metadata = { title: 'Dashboard: New Section' };

export default async function Page() {
  // Server permission guard keeps hidden UI and direct URLs consistent.
  return (
    <PageContainer scrollable={true}>
      <AdminPageGuard
        resource={adminRoutePermissions.sections.create.resource}
        action={adminRoutePermissions.sections.create.action}
      >
        <div className='flex-1 space-y-4'>
          <Heading
            title='Create Section'
            description='Set the section details for your page.'
          />
          <Separator />
          <SectionForm initialData={null} />
        </div>
      </AdminPageGuard>
    </PageContainer>
  );
}
