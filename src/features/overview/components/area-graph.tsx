'use client';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import type { AnalyticsTimelinePoint } from '@/server/action/analytics/types';
import {
  formatAxisLabel,
  formatLongDateLabel,
  formatMetricValue
} from '@/features/overview/lib/analytics-format';

const chartConfig = {
  sessions: {
    label: 'Sessions',
    color: 'var(--chart-1)'
  },
  pageViews: {
    label: 'Page Views',
    color: 'var(--chart-2)'
  }
} satisfies ChartConfig;

type AreaGraphProps = {
  data: AnalyticsTimelinePoint[];
  totalVisitors: number;
};

export function AreaGraph({ data, totalVisitors }: AreaGraphProps) {
  const totalPageViews = data.reduce((sum, item) => sum + item.pageViews, 0);

  return (
    <Card className='@container/card h-full gap-0 overflow-hidden'>
      <CardHeader className='border-b pb-4'>
        <CardTitle>Overview</CardTitle>
        <CardDescription>
          Sessions and page views over the selected analytics range
        </CardDescription>
      </CardHeader>
      <CardContent className='pt-6'>
        <div className='flex flex-col gap-6'>
          <div className='grid gap-4 sm:grid-cols-3'>
            <div className='flex flex-col gap-1'>
              <span className='text-muted-foreground text-xs tracking-wide uppercase'>
                Visitors
              </span>
              <span className='text-2xl font-semibold tabular-nums'>
                {formatMetricValue(totalVisitors, 'number')}
              </span>
            </div>
            <div className='flex flex-col gap-1'>
              <span className='text-muted-foreground text-xs tracking-wide uppercase'>
                Page Views
              </span>
              <span className='text-2xl font-semibold tabular-nums'>
                {formatMetricValue(totalPageViews, 'number')}
              </span>
            </div>
          </div>

          {data.length === 0 ? (
            <div className='text-muted-foreground flex h-[260px] items-center justify-center text-sm'>
              No trend analytics data yet.
            </div>
          ) : (
            <ChartContainer
              config={chartConfig}
              className='aspect-auto h-[260px] w-full'
            >
              <AreaChart
                data={data}
                margin={{
                  left: 12,
                  right: 12
                }}
              >
                <defs>
                  <linearGradient id='fillSessions' x1='0' y1='0' x2='0' y2='1'>
                    <stop
                      offset='5%'
                      stopColor='var(--color-sessions)'
                      stopOpacity={0.22}
                    />
                    <stop
                      offset='95%'
                      stopColor='var(--color-sessions)'
                      stopOpacity={0.04}
                    />
                  </linearGradient>
                  <linearGradient
                    id='fillPageViews'
                    x1='0'
                    y1='0'
                    x2='0'
                    y2='1'
                  >
                    <stop
                      offset='5%'
                      stopColor='var(--color-pageViews)'
                      stopOpacity={0.16}
                    />
                    <stop
                      offset='95%'
                      stopColor='var(--color-pageViews)'
                      stopOpacity={0.03}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey='label'
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={formatAxisLabel}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator='dot'
                      labelFormatter={formatLongDateLabel}
                    />
                  }
                />
                <Area
                  dataKey='pageViews'
                  type='monotone'
                  fill='url(#fillPageViews)'
                  stroke='var(--color-pageViews)'
                  strokeWidth={2}
                />
                <Area
                  dataKey='sessions'
                  type='monotone'
                  fill='url(#fillSessions)'
                  stroke='var(--color-sessions)'
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
