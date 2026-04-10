import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function BarGraphSkeleton() {
  return (
    <Card className='gap-0 overflow-hidden'>
      <CardHeader className='border-b px-6 py-5 sm:py-6'>
        <div className='flex flex-col gap-1'>
          <Skeleton className='h-6 w-[180px]' />
          <Skeleton className='h-4 w-[250px]' />
        </div>
      </CardHeader>
      <CardContent className='px-2 pt-6 sm:px-6'>
        <div className='flex aspect-auto h-[280px] w-full items-end justify-around gap-2 pt-8'>
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton
              key={i}
              className='w-full'
              style={{
                height: `${Math.max(20, Math.random() * 100)}%`
              }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
