'use client';
import { useMedia } from '@/features/media/hook/use-media';

export default function TestApiPage() {
  const { data: media, isLoading, error } = useMedia();
  return (
    <div className='min-h-screen p-6'>
      <div className='rounded-x mx-auto max-w-3xl bg-blue-700 p-6 shadow-md'>
        <p className='mb-4 cursor-pointer bg-pink-400 text-center text-2xl text-pink-600'>
          Testing API Response
        </p>

        {isLoading && <p className='text-gray-500'>Loading...</p>}
        {error && <p className='text-red-500'>Error: {error.message}</p>}

        {media && (
          <div className='/* 👈 constrain height so it can overflow */ /* 👈 enable both axes */ max-h-[70vh] overflow-x-auto overflow-y-auto rounded-lg bg-gray-900 p-4 font-mono text-sm text-green-200'>
            <pre className='whitespace-pre'>
              {JSON.stringify(media, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
