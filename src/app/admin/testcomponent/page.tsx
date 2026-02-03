'use client';

import React, { useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { FileModal } from '@/components/modal/file-modal';
import { handleImageUpload } from '@/lib/tiptap-utils';
import type { ImageUploadResult } from '@/lib/tiptap-utils';
import type { MediaFile } from '@/features/media/types/media-type';

type UploadedItem = {
  id: string;
  name: string;
  type?: string;
  size?: number;
  result: ImageUploadResult;
};

const createUploadId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export default function TestComponentPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [uploadedItems, setUploadedItems] = useState<UploadedItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = (file: MediaFile) => {
    setSelectedMedia(file);
  };

  const handleUploadFromDevice = async (files: File[]) => {
    if (!files.length) return;
    setError(null);
    setIsUploading(true);

    try {
      const results = await Promise.all(
        files.map((file) => handleImageUpload(file))
      );
      setUploadedItems((prev) => [
        ...prev,
        ...results.map((result, index) => ({
          id: createUploadId(),
          name: files[index]?.name ?? `upload-${prev.length + index + 1}`,
          type: files[index]?.type,
          size: files[index]?.size,
          result
        }))
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <PageContainer scrollable={true}>
      <div className='flex flex-1 flex-col gap-6'>
        <div className='flex items-center gap-3'>
          <Button onClick={() => setIsOpen(true)}>Open File Modal</Button>
          {isUploading ? (
            <span className='text-muted-foreground text-sm'>Uploading...</span>
          ) : null}
          {error ? (
            <span className='text-destructive text-sm'>{error}</span>
          ) : null}
        </div>

        <div className='grid gap-6 md:grid-cols-2'>
          <div className='space-y-3'>
            <h3 className='text-sm font-semibold'>
              Selected from Media Manager
            </h3>
            {selectedMedia ? (
              <div className='border-muted space-y-2 rounded-md border p-3'>
                {selectedMedia.type === 'image' ? (
                  <img
                    src={selectedMedia.thumbnail ?? selectedMedia.url}
                    alt={selectedMedia.name}
                    className='h-40 w-full rounded-md object-cover'
                  />
                ) : (
                  <div className='text-muted-foreground flex h-40 flex-col items-center justify-center gap-2 rounded-md border border-dashed text-sm'>
                    <span>{selectedMedia.type.toUpperCase()}</span>
                    <span className='text-xs'>{selectedMedia.url}</span>
                  </div>
                )}
                <div className='text-sm font-medium'>{selectedMedia.name}</div>
                <pre className='bg-muted/40 text-muted-foreground overflow-auto rounded-md p-2 text-xs'>
                  {JSON.stringify(selectedMedia, null, 2)}
                </pre>
              </div>
            ) : (
              <p className='text-muted-foreground text-sm'>
                No media selected yet.
              </p>
            )}
          </div>

          <div className='space-y-3'>
            <h3 className='text-sm font-semibold'>Uploaded from Device</h3>
            {uploadedItems.length > 0 ? (
              <div className='space-y-3'>
                {uploadedItems.map((item) => (
                  <div
                    key={item.id}
                    className='border-muted space-y-2 rounded-md border p-3'
                  >
                    {item.type?.startsWith('image/') ? (
                      <img
                        src={item.result.url}
                        alt={item.name}
                        className='h-40 w-full rounded-md object-cover'
                      />
                    ) : (
                      <div className='text-muted-foreground flex h-40 flex-col items-center justify-center gap-2 rounded-md border border-dashed text-sm'>
                        <span>{(item.type || 'FILE').toUpperCase()}</span>
                        <span className='text-xs'>{item.result.url}</span>
                      </div>
                    )}
                    <div className='text-sm font-medium'>{item.name}</div>
                    <pre className='bg-muted/40 text-muted-foreground overflow-auto rounded-md p-2 text-xs'>
                      {JSON.stringify(item.result, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-muted-foreground text-sm'>No uploads yet.</p>
            )}
          </div>
        </div>
      </div>

      <FileModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSelect={handleSelect}
        onUploadFromDevice={handleUploadFromDevice}
        loading={isUploading}
        title='Insert media'
        description='Upload a new file or pick from Media Manager.'
        accept='*/*'
      />
    </PageContainer>
  );
}
