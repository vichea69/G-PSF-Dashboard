'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, TrendingUp, Edit, Eye } from 'lucide-react';

interface PageStatsProps {
  pages: any[];
}

export function PageStats({ pages }: PageStatsProps) {
  const publishedPages = pages.filter((p) => p.status === 'published');
  const draftPages = pages.filter((p) => p.status === 'draft');

  return (
    <div className='mb-6 grid grid-cols-1 gap-6 md:grid-cols-3'>
      <Card className='border-l-4 border-l-blue-500'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-muted-foreground text-sm font-medium'>
            Total Pages
          </CardTitle>
          <Globe className='h-5 w-5 text-blue-500' />
        </CardHeader>
        <CardContent>
          <div className='text-foreground text-3xl font-bold'>
            {pages.length}
          </div>
          <div className='text-muted-foreground mt-1 flex items-center text-xs'>
            <TrendingUp className='mr-1 h-3 w-3 text-green-500' />
            All pages created
          </div>
        </CardContent>
      </Card>

      <Card className='border-l-4 border-l-green-500'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-muted-foreground text-sm font-medium'>
            Published
          </CardTitle>
          <Eye className='h-5 w-5 text-green-500' />
        </CardHeader>
        <CardContent>
          <div className='text-foreground text-3xl font-bold'>
            {publishedPages.length}
          </div>
          <div className='text-muted-foreground mt-1 flex items-center text-xs'>
            <TrendingUp className='mr-1 h-3 w-3 text-green-500' />
            Live on website
          </div>
        </CardContent>
      </Card>

      <Card className='border-l-4 border-l-amber-500'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-muted-foreground text-sm font-medium'>
            Drafts
          </CardTitle>
          <Edit className='h-5 w-5 text-amber-500' />
        </CardHeader>
        <CardContent>
          <div className='text-foreground text-3xl font-bold'>
            {draftPages.length}
          </div>
          <div className='text-muted-foreground mt-1 flex items-center text-xs'>
            <TrendingUp className='mr-1 h-3 w-3 text-amber-500' />
            Work in progress
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
