'use client';
import { useLogo } from '@/hooks/use-logo';

export default function TestApiPage() {
  const { data: logo, isLoading, error } = useLogo();

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='mx-auto max-w-3xl rounded-xl bg-white p-6 shadow-md'>
        <h1 className='mb-4 text-2xl font-bold text-gray-800'>
          Test API Response
        </h1>

        {isLoading && <p className='text-gray-500'>Loading...</p>}
        {error && <p className='text-red-500'>Error: {error.message}</p>}

        {logo && (
          <div className='/* 👈 constrain height so it can overflow */ /* 👈 enable both axes */ max-h-[70vh] overflow-x-auto overflow-y-auto rounded-lg bg-gray-900 p-4 font-mono text-sm text-green-200'>
            <pre className='whitespace-pre'>
              {JSON.stringify(logo, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
