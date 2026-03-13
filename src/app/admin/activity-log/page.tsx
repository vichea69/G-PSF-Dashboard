import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
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
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Activity Log'
            description='Review recent admin actions in a simple table.'
          />
        </div>

        <Separator />

        <ActivityLogPage items={activityLog.items} />
      </div>
    </PageContainer>
  );
}
