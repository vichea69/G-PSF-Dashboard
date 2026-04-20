import { RecentSales } from '@/features/overview/components/recent-sales';
import { getAnalyticsTopPages } from '@/server/action/analytics/analytics';

export default async function TopPages() {
  const pages = await getAnalyticsTopPages();

  return <RecentSales pages={pages} />;
}
