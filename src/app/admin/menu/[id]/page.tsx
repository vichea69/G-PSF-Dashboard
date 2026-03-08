import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import MenuDetailClient from '@/features/menu/components/MenuDetailClient';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';

type PageProps = { params: Promise<{ id: string }> };

export default async function MenuDetailPage(props: PageProps) {
  const params = await props.params;
  return (
    <AdminPageGuard
      resource={adminRoutePermissions.menu.update.resource}
      action={adminRoutePermissions.menu.update.action}
    >
      <MenuDetailClient slug={params.id} />
    </AdminPageGuard>
  );
}
