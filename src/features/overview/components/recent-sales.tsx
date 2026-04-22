import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { AnalyticsTopPage } from '@/server/action/analytics/types';
import { formatMetricValue } from '@/features/overview/lib/analytics-format';

type RecentSalesProps = {
  pages: AnalyticsTopPage[];
};

export function RecentSales({ pages }: RecentSalesProps) {
  const totalVisitors = pages.reduce((sum, page) => sum + page.visitors, 0);
  const visiblePages = pages.slice(0, 6);

  return (
    <Card className='h-full gap-0 overflow-hidden'>
      <CardHeader className='border-b pb-4'>
        <CardTitle>Top Pages</CardTitle>
        <CardDescription>
          {pages.length > 0
            ? `${formatMetricValue(totalVisitors, 'number')} visits across your most viewed pages`
            : 'No top pages data yet.'}
        </CardDescription>
      </CardHeader>
      <CardContent className='pt-6'>
        {pages.length === 0 ? (
          <div className='text-muted-foreground py-4 text-sm'>
            Connect analytics traffic first, then your top pages will appear
            here.
          </div>
        ) : (
          <div className='flex flex-col gap-4'>
            {visiblePages.map((page, index) => {
              const share =
                totalVisitors > 0 ? (page.visitors / totalVisitors) * 100 : 0;

              return (
                <div
                  key={`${page.path}-${index}`}
                  className='flex flex-col gap-2'
                >
                  <div className='flex items-start gap-3'>
                    <Badge variant='outline' size='sm'>
                      #{index + 1}
                    </Badge>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-medium'>
                        {page.title}
                      </p>
                      <p className='text-muted-foreground truncate text-xs'>
                        {page.path || 'No path provided'}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm font-medium tabular-nums'>
                        {formatMetricValue(page.visitors, 'number')}
                      </p>
                      <p className='text-muted-foreground text-xs'>
                        {share.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <Progress value={share} indicatorClassName='bg-primary' />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      {/* <CardFooter className='text-muted-foreground text-sm'>
        {pages.length > visiblePages.length
          ? `Showing the top ${visiblePages.length} pages from your analytics data`
          : 'Ranked by the highest visit counts'}
      </CardFooter> */}
    </Card>
  );
}
