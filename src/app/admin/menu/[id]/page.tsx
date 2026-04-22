import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import MenuDetailClient from '@/features/menu/components/MenuDetailClient';
import {
  normalizeMenusResponse,
  normalizeMenuTreeResponse
} from '@/features/menu/utils/menu-normalizer';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';
import { getMenusTree, getMenuTreeBySlug } from '@/server/action/menu/menu';

type PageProps = { params: Promise<{ id: string }> };

async function MenuDetailContent({ identifier }: { identifier: string }) {
  const [menuResponse, menusResponse] = await Promise.all([
    getMenuTreeBySlug(identifier).catch(() => null),
    getMenusTree().catch(() => [])
  ]);

  const initialMenus = normalizeMenusResponse(menusResponse);
  const matchedMenu =
    initialMenus.find(
      (menu) => menu.slug === identifier || menu.id === identifier
    ) ?? null;
  const resolvedSlug = matchedMenu?.slug || identifier;

  let initialMenu = menuResponse
    ? normalizeMenuTreeResponse(menuResponse, resolvedSlug)
    : null;

  if (!initialMenu && matchedMenu && matchedMenu.slug !== identifier) {
    const resolvedMenuResponse = await getMenuTreeBySlug(resolvedSlug).catch(
      () => null
    );

    initialMenu = resolvedMenuResponse
      ? normalizeMenuTreeResponse(resolvedMenuResponse, resolvedSlug)
      : matchedMenu;
  }

  return (
    <MenuDetailClient
      slug={resolvedSlug}
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
      <MenuDetailContent identifier={params.id} />
    </AdminPageGuard>
  );
}
