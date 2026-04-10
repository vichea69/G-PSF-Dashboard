import { PieGraph } from '@/features/overview/components/pie-graph';
import { getAnalyticsCountries } from '@/server/action/analytics/analytics';

export default async function Stats() {
  const data = await getAnalyticsCountries();

  return <PieGraph data={data} />;
}
