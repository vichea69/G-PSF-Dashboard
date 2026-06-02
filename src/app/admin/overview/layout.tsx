import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import React, { Suspense } from 'react';
import { getAnalyticsOverview } from '@/server/action/analytics/analytics';
import { formatLongDateLabel } from '@/features/overview/lib/analytics-format';

export default function OverViewLayout({
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
  // Layout no longer awaits analytics. The date-range badge — the only thing
  // here that depends on the analytics call — is wrapped in Suspense so the
  // rest of the page (and the parallel slots, which have their own loading.tsx)
  // can render immediately. Big win on post-login navigation: previously the
  // user clicked "Login" and waited for `await getAnalyticsOverview()` to
  // resolve before *any* of /admin/overview painted.
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col gap-6'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
          <div className='flex flex-col gap-3'>
            <div className='flex flex-col gap-1'>
              <h1 className='text-3xl font-semibold tracking-tight'>
                Traffic Overview
              </h1>
            </div>
          </div>
          <div className='flex flex-col items-start gap-2 lg:items-end'>
            <Suspense fallback={<Skeleton className='h-6 w-56 rounded-full' />}>
              <RangeLabel />
            </Suspense>
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

// Async sub-component — runs in parallel with the slots and streams in when
// ready. If the analytics call fails, we render an empty Badge instead of
// throwing, so a flaky GA upstream can't take down the whole overview page.
async function RangeLabel() {
  try {
    const analytics = await getAnalyticsOverview();
    const firstPoint = analytics.timeline[0];
    const lastPoint = analytics.timeline[analytics.timeline.length - 1];
    const label =
      firstPoint && lastPoint
        ? `${formatLongDateLabel(firstPoint.label)} - ${formatLongDateLabel(
            lastPoint.label
          )}`
        : 'Waiting for more analytics history';
    return <Badge variant='outline'>{label}</Badge>;
  } catch {
    return <Badge variant='outline'>Analytics unavailable</Badge>;
  }
}
