import PageContainer from '@/components/layout/page-container';
import ActivityLogPage from '@/features/activity-log/components/activity-log-page';
import { getActivityLogs } from '@/server/action/activity-log/activity-log';

export const metadata = {
  title: 'Activity Log'
};

export default async function Page() {
  const activityLog = await getActivityLogs().catch(() => {
    return {
      items: [],
      meta: {
        total: 0,
        page: 1,
        limit: 100,
        totalPages: 1
      }
    };
  });

  return (
    <PageContainer scrollable>
      <ActivityLogPage items={activityLog.items} />
    </PageContainer>
  );
}
