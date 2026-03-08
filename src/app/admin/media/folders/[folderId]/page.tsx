import { AdminPageGuard } from '@/components/permissions/admin-page-guard';
import { MediaManager } from '@/features/media/components/media-manager';
import { adminRoutePermissions } from '@/lib/admin-route-permissions';

type MediaFolderPageProps = {
  params: Promise<{
    folderId: string;
  }>;
};

export default async function MediaFolderPage(props: MediaFolderPageProps) {
  const params = await props.params;
  return (
    <AdminPageGuard
      resource={adminRoutePermissions.media.list.resource}
      action={adminRoutePermissions.media.list.action}
    >
      <MediaManager folderId={params.folderId} />
    </AdminPageGuard>
  );
}
