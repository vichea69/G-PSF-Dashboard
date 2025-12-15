'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Trash2, RefreshCw, Download } from 'lucide-react';
import {
  formatFileSize,
  formatDate,
  type MediaFile
} from '@/features/media/types/media-type';
import Image from 'next/image';

interface PreviewModalProps {
  file: MediaFile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PreviewModal({ file, open, onOpenChange }: PreviewModalProps) {
  if (!file) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(file.url);
  };

  const handleDelete = () => {
    console.log('Delete file:', file.id);

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='h-[80vh] max-w-4xl'>
        <DialogHeader>
          <DialogTitle className='text-balance'>{file.name}</DialogTitle>
        </DialogHeader>

        <div className='flex flex-1 gap-6 overflow-hidden'>
          {/* Preview Area */}
          <div className='bg-muted flex flex-1 items-center justify-center overflow-hidden rounded-lg'>
            {file.type === 'image' && file.url ? (
              <div className='relative h-full w-full'>
                <Image
                  src={file.url || '/placeholder.svg'}
                  alt={file.name}
                  fill
                  className='object-contain'
                  unoptimized
                />
              </div>
            ) : file.type === 'video' ? (
              <div className='flex h-full items-center justify-center'>
                <div className='text-center'>
                  <p className='text-muted-foreground'>Video preview</p>
                  <p className='text-muted-foreground mt-2 text-sm'>
                    {file.name}
                  </p>
                </div>
              </div>
            ) : (
              <div className='text-center'>
                <p className='text-muted-foreground'>
                  {file.type.toUpperCase()} File
                </p>
                <p className='text-muted-foreground mt-2 text-sm'>
                  Preview not available
                </p>
              </div>
            )}
          </div>

          {/* Metadata Sidebar */}
          <div className='w-64 space-y-6'>
            <div>
              <h4 className='mb-3 text-sm font-semibold'>File Details</h4>
              <dl className='space-y-2 text-sm'>
                <div>
                  <dt className='text-muted-foreground'>Type</dt>
                  <dd className='capitalize'>{file.type}</dd>
                </div>
                <div>
                  <dt className='text-muted-foreground'>Size</dt>
                  <dd>{formatFileSize(file.size)}</dd>
                </div>
                <div>
                  <dt className='text-muted-foreground'>Uploaded</dt>
                  <dd>{formatDate(file.uploadedAt)}</dd>
                </div>
              </dl>
            </div>

            <div className='space-y-2'>
              <Button
                className='w-full justify-start bg-transparent'
                variant='outline'
                onClick={handleCopyUrl}
              >
                <Copy className='mr-2 h-4 w-4' />
                Copy URL
              </Button>
              <Button
                className='w-full justify-start bg-transparent'
                variant='outline'
                onClick={() => console.log('Download:', file.id)}
              >
                <Download className='mr-2 h-4 w-4' />
                Download
              </Button>
              <Button
                className='w-full justify-start bg-transparent'
                variant='outline'
                onClick={() => console.log('Replace:', file.id)}
              >
                <RefreshCw className='mr-2 h-4 w-4' />
                Replace
              </Button>
              <Button
                className='w-full justify-start'
                variant='destructive'
                onClick={handleDelete}
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
