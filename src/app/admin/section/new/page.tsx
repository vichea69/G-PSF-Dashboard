import PageContainer from '@/components/layout/page-container';
import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import SectionFormPage from '@/features/section/components/section-form-page';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';

export const metadata = { title: 'Dashboard: New Section' };

type PageProps = {
  searchParams?: Promise<{ pageId?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const pageIdValue = String(resolvedSearchParams?.pageId ?? '').trim();
  const initialPageId = Number(pageIdValue);

  // Server permission guard keeps hidden UI and direct URLs consistent.
  return (
    <PageContainer scrollable={true}>
      <AdminPageGuard
        resource={adminRoutePermissions.sections.create.resource}
        action={adminRoutePermissions.sections.create.action}
      >
        <SectionFormPage
          initialData={null}
          initialPageId={Number.isFinite(initialPageId) ? initialPageId : 0}
        />
      </AdminPageGuard>
    </PageContainer>
  );
}
