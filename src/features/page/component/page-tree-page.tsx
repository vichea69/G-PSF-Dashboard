import { getPageTree } from '@/server/action/page/page';
import PageTreeScreen from './page-tree-screen';
import { type PageTreeData } from './page-tree-view';

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

  return '';
}

export default async function PageTreePage({ pageId }: { pageId: string }) {
  try {
    const response = await getPageTree(pageId);
    const data = extractPageTreeData(response);

    return <PageTreeScreen pageId={pageId} data={data} />;
  } catch (error) {
    return (
      <PageTreeScreen pageId={pageId} errorMessage={getErrorMessage(error)} />
    );
  }
}
