import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import MenuDetailClient from '@/features/menu/components/MenuDetailClient';
import {
  normalizeMenusResponse,
  normalizeMenuTreeResponse
} from '@/features/menu/utils/menu-normalizer';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';
import { getMenusTree, getMenuTreeBySlug } from '@/server/action/menu/menu';

type PageProps = { params: Promise<{ id: string }> };

async function MenuDetailContent({ slug }: { slug: string }) {
  const [menuResponse, menusResponse] = await Promise.all([
    getMenuTreeBySlug(slug).catch(() => null),
    getMenusTree().catch(() => [])
  ]);

  const initialMenu = menuResponse
    ? normalizeMenuTreeResponse(menuResponse, slug)
    : null;
  const initialMenus = normalizeMenusResponse(menusResponse);

  return (
    <MenuDetailClient
      slug={slug}
      initialMenu={initialMenu}
      initialMenus={initialMenus}
    />
  );
}

export default async function MenuDetailPage(props: PageProps) {
  const params = await props.params;
  return (
    <AdminPageGuard
      resource={adminRoutePermissions.menu.update.resource}
      action={adminRoutePermissions.menu.update.action}
    >
      <MenuDetailContent slug={params.id} />
    </AdminPageGuard>
  );
}
