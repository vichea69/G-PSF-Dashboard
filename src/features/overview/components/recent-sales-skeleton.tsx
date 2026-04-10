import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function RecentSalesSkeleton() {
  return (
    <Card className='h-full gap-0 overflow-hidden'>
      <CardHeader className='border-b px-6 py-5 sm:py-6'>
        <div className='flex flex-col gap-1'>
          <Skeleton className='h-6 w-[140px]' />
          <Skeleton className='h-4 w-[180px]' />
        </div>
      </CardHeader>
      <CardContent className='pt-6'>
        <div className='flex flex-col gap-4'>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='flex flex-col gap-2'>
              <div className='flex items-start gap-3'>
                <Skeleton className='h-5 w-8' />
                <div className='flex flex-1 flex-col gap-1'>
                  <Skeleton className='h-4 w-[120px]' />
                  <Skeleton className='h-3 w-[160px]' />
                </div>
                <div className='flex flex-col items-end gap-1'>
                  <Skeleton className='h-4 w-[80px]' />
                  <Skeleton className='h-3 w-[48px]' />
                </div>
              </div>
              <Skeleton className='h-1.5 w-full' />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
