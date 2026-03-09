import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import ActivityLogPage from '@/features/activity-log/components/activity-log-page';
import { mockActivityLogResult } from '@/features/activity-log/mock-activity-log';
import { getActivityLogs } from '@/server/action/activity-log/activity-log';

export const metadata = {
  title: 'Activity Log'
};

export default async function Page() {
  // Fallback mock data keeps the page visible if the new API is not ready yet.
  const activityLog = await getActivityLogs().catch(
    () => mockActivityLogResult
  );

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
