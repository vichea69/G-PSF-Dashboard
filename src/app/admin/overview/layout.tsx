import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import React from 'react';
import { getAnalyticsOverview } from '@/server/action/analytics/analytics';
import { formatLongDateLabel } from '@/features/overview/lib/analytics-format';

export default async function OverViewLayout({
  top_page,
  pie_stats,
  bar_stats,
  area_stats
}: {
  top_page: React.ReactNode;
  pie_stats: React.ReactNode;
  bar_stats: React.ReactNode;
  area_stats: React.ReactNode;
}) {
  const analytics = await getAnalyticsOverview();
  const firstTimelinePoint = analytics.timeline[0];
  const lastTimelinePoint = analytics.timeline[analytics.timeline.length - 1];
  const rangeLabel =
    firstTimelinePoint && lastTimelinePoint
      ? `${formatLongDateLabel(firstTimelinePoint.label)} - ${formatLongDateLabel(
          lastTimelinePoint.label
        )}`
      : 'Waiting for more analytics history';

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col gap-6'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
          <div className='flex flex-col gap-3'>
            <div className='flex flex-wrap items-center gap-2'>
              {/* <Badge variant='secondary' appearance='light'>
                Google Analytics
              </Badge> */}
              {/* <Badge variant='outline'>Server rendered</Badge> */}
            </div>
            <div className='flex flex-col gap-1'>
              <h1 className='text-3xl font-semibold tracking-tight'>
                Traffic Overview
              </h1>
            </div>
          </div>
          <div className='flex flex-col items-start gap-2 lg:items-end'>
            <Badge variant='outline'>{rangeLabel}</Badge>
            {/* <p className='text-muted-foreground text-sm'>
              Source: overview, top pages, countries, and browsers endpoints
            </p> */}
          </div>
        </div>
        <div className='grid grid-cols-1 gap-4 xl:grid-cols-12'>
          <div className='xl:col-span-8'>{area_stats}</div>
          <div className='xl:col-span-4'>{top_page}</div>
          <div className='xl:col-span-6'>{pie_stats}</div>
          <div className='xl:col-span-6'>{bar_stats}</div>
        </div>
      </div>
    </PageContainer>
  );
}
