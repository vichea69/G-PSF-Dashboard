'use client';

import * as React from 'react';
import { Area, AreaChart } from 'recharts';
import { Badge } from '@/components/ui/badge';
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
import type { AnalyticsTimelinePoint } from '@/server/action/analytics/types';
import {
  formatChangeValue,
  formatLongDateLabel,
  formatMetricValue,
  getTrendDirection
} from '@/features/overview/lib/analytics-format';

type SummaryMetricCardProps = {
  title: string;
  value: number;
  change: number | null;
  helper: string;
  kind?: 'number' | 'percent';
  timeline: AnalyticsTimelinePoint[];
  dataKey: 'sessions' | 'activeUsers' | 'newUsers' | 'pageViews';
};

const chartConfig = {
  value: {
    label: 'Value',
    color: 'var(--chart-1)'
  }
} satisfies ChartConfig;

export function SummaryMetricCard({
  title,
  value,
  change,
  helper,
  kind = 'number',
  timeline,
  dataKey
}: SummaryMetricCardProps) {
  const gradientId = React.useId().replace(/:/g, '');
  const sparklineData = timeline.map((item) => ({
    label: item.label,
    value: item[dataKey]
  }));
  const changeLabel = formatChangeValue(change);
  const direction = getTrendDirection(change);

  return (
    <Card className='gap-0 overflow-hidden'>
      <CardHeader className='border-b pb-4'>
        <CardDescription>{title}</CardDescription>
        <CardTitle className='text-3xl font-semibold tabular-nums'>
          {formatMetricValue(value, kind)}
        </CardTitle>
        <CardAction>
          <Badge variant='outline' size='sm'>
            {changeLabel ?? 'No change'}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className='pt-4'>
        <div className='flex flex-col gap-3'>
          <p className='text-muted-foreground text-sm'>{helper}</p>
          {sparklineData.length === 0 ? (
            <div className='text-muted-foreground flex h-16 items-center text-sm'>
              Waiting for more analytics history.
            </div>
          ) : (
            <ChartContainer
              config={chartConfig}
              className='h-16 w-full justify-start'
            >
              <AreaChart
                data={sparklineData}
                margin={{
                  left: 0,
                  right: 0,
                  top: 4,
                  bottom: 0
                }}
              >
                <defs>
                  <linearGradient
                    id={`summaryFill-${gradientId}`}
                    x1='0'
                    y1='0'
                    x2='0'
                    y2='1'
                  >
                    <stop
                      offset='0%'
                      stopColor='var(--color-value)'
                      stopOpacity={0.22}
                    />
                    <stop
                      offset='100%'
                      stopColor='var(--color-value)'
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideIndicator
                      labelFormatter={(label) =>
                        formatLongDateLabel(String(label))
                      }
                    />
                  }
                />
                <Area
                  dataKey='value'
                  type='monotone'
                  fill={`url(#summaryFill-${gradientId})`}
                  stroke='var(--color-value)'
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </div>
      </CardContent>
      <CardFooter className='text-muted-foreground text-xs'>
        {direction === 'down'
          ? 'Down from the previous period'
          : direction === 'up'
            ? 'Up from the previous period'
            : 'No previous-period comparison yet'}
      </CardFooter>
    </Card>
  );
}
