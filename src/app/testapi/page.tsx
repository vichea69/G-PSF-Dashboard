'use client';
import { usePage } from '@/hooks/use-page';

export default function TestApiPage() {
  const { data: pages } = usePage();

  return (
    <div>
      <h1>Test API</h1>
      <pre>{JSON.stringify(pages, null, 2)}</pre>
    </div>
  );
}
