import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import { MediaManager } from '@/features/media/components/media-manager';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';

export default function Page() {
  return (
    <AdminPageGuard
      resource={adminRoutePermissions.media.list.resource}
      action={adminRoutePermissions.media.list.action}
    >
      <MediaManager />
    </AdminPageGuard>
  );
}
