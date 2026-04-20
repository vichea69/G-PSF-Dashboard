import { AreaGraph } from '@/features/overview/components/area-graph';
import {
  getAnalyticsOverview,
  getAnalyticsCountries
} from '@/server/action/analytics/analytics';

export default async function AreaStats() {
  const [analytics, countries] = await Promise.all([
    getAnalyticsOverview(),
    getAnalyticsCountries()
  ]);
  const totalVisitors = countries.reduce((sum, c) => sum + c.visitors, 0);

  return <AreaGraph data={analytics.timeline} totalVisitors={totalVisitors} />;
}
