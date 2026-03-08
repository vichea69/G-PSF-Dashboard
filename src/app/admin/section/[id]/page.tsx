import PageContainer from '@/components/layout/page-container';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import SectionForm from '@/features/section/components/section-form';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';
import { getSectionById } from '@/server/action/section/section';

export const metadata = { title: 'Dashboard: Edit Section' };

type PageProps = { params: Promise<{ id: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  // Server permission guard keeps hidden UI and direct URLs consistent.
  return (
    <PageContainer scrollable>
      <AdminPageGuard
        resource={adminRoutePermissions.sections.update.resource}
        action={adminRoutePermissions.sections.update.action}
      >
        <SectionEditContent sectionId={params.id} />
      </AdminPageGuard>
    </PageContainer>
  );
}

async function SectionEditContent({ sectionId }: { sectionId: string }) {
  const payload = await getSectionById(sectionId);
  const section = (payload as any)?.data ?? payload;

  return (
    <div className='flex-1 space-y-4'>
      <Heading title='Edit Section' description='Update the section details.' />
      <Separator />
      <SectionForm initialData={section} />
    </div>
  );
}
