import { AreaGraph } from '@/features/overview/components/area-graph';
import { getAnalyticsOverview } from '@/server/action/analytics/analytics';

export default async function AreaStats() {
  const analytics = await getAnalyticsOverview();

  return <AreaGraph data={analytics.timeline} />;
}
