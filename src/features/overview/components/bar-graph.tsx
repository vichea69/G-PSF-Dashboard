'use client';

import { Badge } from '@/components/ui/badge';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import type { AnalyticsBrowser } from '@/server/action/analytics/types';
import { formatMetricValue } from '@/features/overview/lib/analytics-format';

const chartConfig = {
  visitors: {
    label: 'Visitors',
    color: 'var(--chart-1)'
  }
} satisfies ChartConfig;

type BarGraphProps = {
  data: AnalyticsBrowser[];
};

export function BarGraph({ data }: BarGraphProps) {
  const totalVisitors = data.reduce((sum, item) => sum + item.visitors, 0);
  const topBrowser = data[0] ?? null;
  const topBrowserShare =
    topBrowser && totalVisitors > 0
      ? (topBrowser.visitors / totalVisitors) * 100
      : null;

  return (
    <Card className='@container/card gap-0 overflow-hidden'>
      <CardHeader className='border-b pb-4'>
        <CardTitle>Browsers</CardTitle>
        <CardDescription>
          Traffic split by browser from Google Analytics
        </CardDescription>
        {topBrowser ? (
          <CardAction>
            <Badge variant='outline' size='sm'>
              {topBrowser.browser} {topBrowserShare?.toFixed(1)}%
            </Badge>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent className='px-2 pt-6 sm:px-6'>
        {data.length === 0 ? (
          <div className='text-muted-foreground flex h-[250px] items-center justify-center text-sm'>
            No browser analytics data yet.
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className='aspect-auto h-[250px] w-full'
          >
            <BarChart
              data={data}
              margin={{
                left: 12,
                right: 12
              }}
            >
              <defs>
                <linearGradient id='fillBrowsers' x1='0' y1='0' x2='0' y2='1'>
                  <stop
                    offset='0%'
                    stopColor='var(--chart-1)'
                    stopOpacity={0.85}
                  />
                  <stop
                    offset='100%'
                    stopColor='var(--chart-1)'
                    stopOpacity={0.22}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey='browser'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis tickLine={false} axisLine={false} width={42} />
              <ChartTooltip
                cursor={{ fill: 'var(--chart-1)', opacity: 0.06 }}
                content={<ChartTooltipContent />}
              />
              <Bar
                dataKey='visitors'
                fill='url(#fillBrowsers)'
                radius={[6, 6, 0, 0]}
                maxBarSize={56}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className='text-muted-foreground text-sm'>
        {topBrowser && topBrowserShare !== null
          ? `${topBrowser.browser} leads with ${topBrowserShare.toFixed(1)}% of browser traffic`
          : `Total tracked visitors: ${formatMetricValue(totalVisitors, 'number')}`}
      </CardFooter>
    </Card>
  );
}
