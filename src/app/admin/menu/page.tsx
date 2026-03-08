import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import MenuPageClient from '@/features/menu/components/menu-page-client';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';

export default function MenuListPage() {
  return (
    <AdminPageGuard
      resource={adminRoutePermissions.menu.list.resource}
      action={adminRoutePermissions.menu.list.action}
    >
      <MenuPageClient />
    </AdminPageGuard>
  );
}
