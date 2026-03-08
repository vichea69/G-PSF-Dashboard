import PageContainer from '@/components/layout/page-container';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import WorkingGroupForm from '@/features/working-group/component/working-group-form';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';
import { getWorkingGroupById } from '@/server/action/working-group/working-group';

export const metadata = {
  title: 'Dashboard: Edit Working Group'
};

type PageProps = { params: Promise<{ id: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  // Server permission guard keeps hidden UI and direct URLs consistent.
  return (
    <PageContainer scrollable>
      <AdminPageGuard
        resource={adminRoutePermissions.workingGroups.update.resource}
        action={adminRoutePermissions.workingGroups.update.action}
      >
        <WorkingGroupEditContent workingGroupId={params.id} />
      </AdminPageGuard>
    </PageContainer>
  );
}

async function WorkingGroupEditContent({
  workingGroupId
}: {
  workingGroupId: string;
}) {
  const workingGroup = await getWorkingGroupById(workingGroupId);

  return (
    <div className='flex-1 space-y-4'>
      <Heading
        title='Edit Working Group'
        description='Update localized title, description, page and status.'
      />
      <Separator />
      <WorkingGroupForm initialData={workingGroup} />
    </div>
  );
}
