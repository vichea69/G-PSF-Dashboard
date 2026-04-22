'use client';

import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import {
  Card,
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
import type { AnalyticsTimelinePoint } from '@/server/action/analytics/types';
import {
  formatChangeValue,
  formatAxisLabel,
  formatLongDateLabel,
  formatMetricValue,
  getTrendDirection
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

function calculateTrend(data: AnalyticsTimelinePoint[]) {
  if (data.length < 2) {
    return null;
  }

  const first = data[0]?.sessions ?? 0;
  const last = data[data.length - 1]?.sessions ?? 0;

  if (first <= 0) {
    return null;
  }

  return ((last - first) / first) * 100;
}

export function AreaGraph({ data, totalVisitors }: AreaGraphProps) {
  const trend = calculateTrend(data);
  const direction = getTrendDirection(trend);
  const trendLabel = formatChangeValue(trend);
  const rangeLabel =
    data.length > 1
      ? `${formatLongDateLabel(data[0].label)} - ${formatLongDateLabel(
          data[data.length - 1].label
        )}`
      : 'Waiting for more timeline data';
  const totalPageViews = data.reduce((sum, item) => sum + item.pageViews, 0);

  return (
    <Card className='@container/card gap-0 overflow-hidden'>
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
      <CardFooter>
        <div className='flex w-full items-start gap-2 text-sm'>
          <div className='grid gap-2'>
            <div className='flex items-center gap-2 leading-none font-medium'>
              {trendLabel === null
                ? 'Trend will appear after more history is collected'
                : `${trendLabel} compared with the start of this range`}
              {trendLabel === null ||
              direction === 'neutral' ? null : direction === 'down' ? (
                <IconTrendingDown className='size-4' />
              ) : (
                <IconTrendingUp className='size-4' />
              )}
            </div>
            <div className='text-muted-foreground flex items-center gap-2 leading-none'>
              {rangeLabel}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
