import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getPageTree } from '@/server/action/page/page';
import { PageTreeView, type PageTreeData } from './page-tree-view';

function extractPageTreeData(payload: unknown): PageTreeData {
  const raw = payload as any;

  if (raw?.data && typeof raw.data === 'object') {
    return raw.data as PageTreeData;
  }

  return (raw ?? {}) as PageTreeData;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return 'Failed to load page tree.';
}

export default async function PageTreePage({ pageId }: { pageId: string }) {
  try {
    const response = await getPageTree(pageId);
    const data = extractPageTreeData(response);

    return <PageTreeView pageId={pageId} data={data} />;
  } catch (error) {
    return (
      <Alert variant='destructive' appearance='light'>
        <AlertTitle>Unable to load page tree</AlertTitle>
        <AlertDescription>{getErrorMessage(error)}</AlertDescription>
      </Alert>
    );
  }
}
