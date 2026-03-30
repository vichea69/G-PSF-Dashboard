import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import MenuPageClient from '@/features/menu/components/menu-page-client';
import { normalizeMenusResponse } from '@/features/menu/utils/menu-normalizer';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';
import { getMenusTree } from '@/server/action/menu/menu';

async function MenuListContent() {
  const initialMenus = await getMenusTree()
    .then((response) => normalizeMenusResponse(response))
    .catch(() => []);

  return <MenuPageClient initialMenus={initialMenus} />;
}

export default function MenuListPage() {
  return (
    <AdminPageGuard
      resource={adminRoutePermissions.menu.list.resource}
      action={adminRoutePermissions.menu.list.action}
    >
      <MenuListContent />
    </AdminPageGuard>
  );
}
