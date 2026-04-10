'use client';

import { Badge } from '@/components/ui/badge';
import { Label, Pie, PieChart } from 'recharts';
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
import { Progress } from '@/components/ui/progress';
import type { AnalyticsCountry } from '@/server/action/analytics/types';
import { formatMetricValue } from '@/features/overview/lib/analytics-format';

const chartConfig = {
  visitors: {
    label: 'Visitors',
    color: 'var(--chart-1)'
  }
} satisfies ChartConfig;

type PieGraphProps = {
  data: AnalyticsCountry[];
};

export function PieGraph({ data }: PieGraphProps) {
  const totalVisitors = data.reduce((acc, curr) => acc + curr.visitors, 0);
  const topCountry = data[0] ?? null;
  const topCountries = data.slice(0, 5);

  return (
    <Card className='@container/card gap-0 overflow-hidden'>
      <CardHeader className='border-b pb-4'>
        <CardTitle>Visitors by Country</CardTitle>
        <CardDescription>
          Country distribution from your analytics traffic
        </CardDescription>
        {topCountry ? (
          <CardAction>
            <Badge variant='outline' size='sm'>
              {topCountry.country}
            </Badge>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent className='px-2 pt-6 sm:px-6'>
        {data.length === 0 ? (
          <div className='text-muted-foreground flex h-[250px] items-center justify-center text-sm'>
            No country analytics data yet.
          </div>
        ) : (
          <div className='grid gap-6 lg:grid-cols-[220px_1fr] lg:items-center'>
            <ChartContainer
              config={chartConfig}
              className='mx-auto aspect-square h-[220px]'
            >
              <PieChart>
                <defs>
                  {data.map((country, index) => (
                    <linearGradient
                      key={country.country}
                      id={`countryFill${index}`}
                      x1='0'
                      y1='0'
                      x2='0'
                      y2='1'
                    >
                      <stop
                        offset='0%'
                        stopColor='var(--chart-1)'
                        stopOpacity={Math.max(0.28, 0.95 - index * 0.12)}
                      />
                      <stop
                        offset='100%'
                        stopColor='var(--chart-1)'
                        stopOpacity={Math.max(0.12, 0.5 - index * 0.08)}
                      />
                    </linearGradient>
                  ))}
                </defs>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={data.map((item, index) => ({
                    ...item,
                    fill: `url(#countryFill${index})`
                  }))}
                  dataKey='visitors'
                  nameKey='country'
                  innerRadius={56}
                  strokeWidth={2}
                  stroke='var(--background)'
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor='middle'
                            dominantBaseline='middle'
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className='fill-foreground text-3xl font-bold'
                            >
                              {formatMetricValue(totalVisitors, 'number')}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 24}
                              className='fill-muted-foreground text-sm'
                            >
                              Visitors
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>

            <div className='flex flex-col gap-4'>
              {topCountries.map((country) => {
                const share =
                  totalVisitors > 0
                    ? (country.visitors / totalVisitors) * 100
                    : 0;

                return (
                  <div key={country.country} className='flex flex-col gap-2'>
                    <div className='flex items-start justify-between gap-3'>
                      <div className='min-w-0'>
                        <p className='truncate text-sm font-medium'>
                          {country.country}
                        </p>
                        <p className='text-muted-foreground text-xs'>
                          {formatMetricValue(country.visitors, 'number')}{' '}
                          visitors
                        </p>
                      </div>
                      <Badge variant='outline' size='sm'>
                        {share.toFixed(1)}%
                      </Badge>
                    </div>
                    <Progress value={share} indicatorClassName='bg-primary' />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className='text-muted-foreground text-sm'>
        {topCountry
          ? `${topCountry.country} leads with ${(
              (topCountry.visitors / totalVisitors) *
              100
            ).toFixed(1)}% of geographic traffic`
          : 'Waiting for country data'}
      </CardFooter>
    </Card>
  );
}
