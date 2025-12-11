'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Eye,
  Trash2,
  FileImage,
  FileVideo,
  FileText,
  File
} from 'lucide-react';
import {
  formatFileSize,
  formatDate,
  type MediaFile
} from '@/lib/mock-media-data';
import Image from 'next/image';

interface MediaListViewProps {
  files: MediaFile[];
  selectedFiles: Set<string>;
  onToggleSelection: (fileId: string) => void;
  onPreview: (file: MediaFile) => void;
}

export function MediaListView({
  files,
  selectedFiles,
  onToggleSelection,
  onPreview
}: MediaListViewProps) {
  const getFileIcon = (type: MediaFile['type']) => {
    switch (type) {
      case 'image':
        return <FileImage className='text-muted-foreground h-5 w-5' />;
      case 'video':
        return <FileVideo className='text-muted-foreground h-5 w-5' />;
      case 'pdf':
      case 'document':
        return <FileText className='text-muted-foreground h-5 w-5' />;
      default:
        return <File className='text-muted-foreground h-5 w-5' />;
    }
  };

  return (
    <div className='p-6'>
      <div className='border-border bg-card overflow-hidden rounded-lg border'>
        {/* Table Header */}
        <div className='border-border bg-muted/50 text-muted-foreground grid grid-cols-[auto_60px_1fr_120px_120px_120px_100px] gap-4 border-b px-4 py-3 text-sm font-medium'>
          <div className='w-8'></div>
          <div>Preview</div>
          <div>Name</div>
          <div>Type</div>
          <div>Size</div>
          <div>Date</div>
          <div className='text-right'>Actions</div>
        </div>

        {/* Table Body */}
        <div className='divide-border divide-y'>
          {files.map((file) => (
            <div
              key={file.id}
              className='hover:bg-muted/30 grid grid-cols-[auto_60px_1fr_120px_120px_120px_100px] items-center gap-4 px-4 py-3 transition-colors'
            >
              {/* Checkbox */}
              <div className='w-8'>
                <Checkbox
                  checked={selectedFiles.has(file.id)}
                  onCheckedChange={() => onToggleSelection(file.id)}
                />
              </div>

              {/* Thumbnail */}
              <div className='bg-muted relative h-10 w-10 overflow-hidden rounded'>
                {file.type === 'image' && file.thumbnail ? (
                  <Image
                    src={file.thumbnail || '/placeholder.svg'}
                    alt={file.name}
                    fill
                    className='object-cover'
                    unoptimized
                  />
                ) : (
                  <div className='flex h-full items-center justify-center'>
                    {getFileIcon(file.type)}
                  </div>
                )}
              </div>

              {/* Name */}
              <div className='text-foreground truncate text-sm font-medium'>
                {file.name}
              </div>

              {/* Type */}
              <div className='text-muted-foreground text-sm capitalize'>
                {file.type}
              </div>

              {/* Size */}
              <div className='text-muted-foreground text-sm'>
                {formatFileSize(file.size)}
              </div>

              {/* Date */}
              <div className='text-muted-foreground text-sm'>
                {formatDate(file.uploadedAt)}
              </div>

              {/* Actions */}
              <div className='flex justify-end gap-2'>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={() => onPreview(file)}
                >
                  <Eye className='h-4 w-4' />
                </Button>
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={() => console.log('Delete', file.id)}
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
