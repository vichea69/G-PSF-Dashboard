import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function PieGraphSkeleton() {
  return (
    <Card className='gap-0 overflow-hidden'>
      <CardHeader className='border-b px-6 py-5 sm:py-6'>
        <div className='flex flex-col gap-1'>
          <Skeleton className='h-6 w-[180px]' />
          <Skeleton className='h-4 w-[250px]' />
        </div>
      </CardHeader>
      <CardContent className='pt-6'>
        <div className='grid gap-6 lg:grid-cols-[220px_1fr] lg:items-center'>
          <div className='flex justify-center'>
            <Skeleton className='size-[220px] rounded-full' />
          </div>
          <div className='flex flex-col gap-4'>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className='flex flex-col gap-2'>
                <div className='flex items-center justify-between gap-3'>
                  <div className='flex flex-col gap-1'>
                    <Skeleton className='h-4 w-[120px]' />
                    <Skeleton className='h-3 w-[80px]' />
                  </div>
                  <Skeleton className='h-5 w-[54px]' />
                </div>
                <Skeleton className='h-1.5 w-full' />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
