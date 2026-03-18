import PageContainer from '@/components/layout/page-container';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';
import { getWorkingGroupById } from '@/server/action/working-group/working-group';
import WorkingGroupFormPage from '@/features/working-group/component/working-group-form-page';

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

  return <WorkingGroupFormPage initialData={workingGroup} />;
}
