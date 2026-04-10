import { BarGraph } from '@/features/overview/components/bar-graph';
import { getAnalyticsBrowsers } from '@/server/action/analytics/analytics';

export default async function BarStats() {
  const data = await getAnalyticsBrowsers();

  return <BarGraph data={data} />;
}
