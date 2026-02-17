import { MediaManager } from '@/features/media/components/media-manager';

type MediaFolderPageProps = {
  params: Promise<{
    folderId: string;
  }>;
};

export default async function MediaFolderPage(props: MediaFolderPageProps) {
  const params = await props.params;
  return <MediaManager folderId={params.folderId} />;
}
