'use client';

import { useCallback } from 'react';
import {
  Image as ImageIcon,
  Upload as UploadIcon,
  X as XIcon
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  formatBytes,
  useFileUpload,
  type FileMetadata,
  type FileWithPreview
} from '@/hooks/use-file-upload';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';

interface SiteImageProps {
  onProfileImageChange?: (files: FileWithPreview[]) => void;
  onLogoImageChange?: (files: FileWithPreview[]) => void;
  initialLogoFiles?: FileMetadata[];
}

interface ImageUploadFieldProps {
  title: string;
  description?: string;
  settingKey?: string;
  accept: string;
  maxSize: number;
  onChange?: (files: FileWithPreview[]) => void;
  initialFiles?: FileMetadata[];
}

function ImageUploadField({
  accept,
  maxSize,
  onChange,
  initialFiles
}: ImageUploadFieldProps) {
  const [{ files, isDragging, errors }, actions] = useFileUpload({
    accept,
    maxSize,
    multiple: false,
    initialFiles,
    onFilesChange: onChange
  });

  const currentFile = files[0];

  const handleBrowse = useCallback(() => {
    actions.openFileDialog();
  }, [actions]);

  const handleRemove = useCallback(() => {
    if (currentFile) {
      actions.removeFile(currentFile.id);
    }
  }, [actions, currentFile]);

  return (
    <div className='space-y-3'>
      <div
        className={cn(
          'relative flex min-h-[180px] flex-col justify-center rounded-lg border border-dashed transition-colors',
          currentFile ? 'border-border bg-muted/30' : 'bg-background',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'hover:border-muted-foreground/50'
        )}
        onDragEnter={actions.handleDragEnter}
        onDragLeave={actions.handleDragLeave}
        onDragOver={actions.handleDragOver}
        onDrop={actions.handleDrop}
      >
        <input
          {...actions.getInputProps({
            accept,
            multiple: false
          })}
          className='sr-only'
        />

        {currentFile ? (
          <div className='bg-muted/40 relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg p-6'>
            {currentFile.preview ? (
              <Image
                src={currentFile.preview}
                alt={
                  currentFile.file instanceof File
                    ? currentFile.file.name
                    : currentFile.file.name
                }
                width={144}
                height={144}
                className='h-auto max-h-36 w-auto object-contain'
                unoptimized
              />
            ) : (
              <span className='bg-muted flex h-20 w-20 items-center justify-center rounded-full'>
                <ImageIcon className='text-muted-foreground h-8 w-8' />
              </span>
            )}

            <Button
              type='button'
              size='icon'
              variant='ghost'
              className='bg-background/80 text-foreground absolute top-2 left-2 h-7 w-7 rounded-full shadow'
              onClick={handleRemove}
            >
              <XIcon className='h-4 w-4' />
            </Button>

            <div className='absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-black/75 px-3 py-2 text-xs text-white'>
              <span className='truncate'>
                {currentFile.file instanceof File
                  ? currentFile.file.name
                  : currentFile.file.name}
              </span>
              <span>
                {formatBytes(
                  currentFile.file instanceof File
                    ? currentFile.file.size
                    : currentFile.file.size
                )}
              </span>
            </div>
          </div>
        ) : (
          <div className='flex flex-1 flex-col items-center justify-center gap-3 px-6 py-8 text-center'>
            <span className='bg-muted flex h-14 w-14 items-center justify-center rounded-full'>
              <ImageIcon className='text-muted-foreground h-6 w-6' />
            </span>
            <div className='text-muted-foreground space-y-1 text-sm'>
              <p className='text-foreground font-medium'>
                Drag & drop your file or{' '}
                <button
                  type='button'
                  className='text-primary underline underline-offset-2'
                  onClick={handleBrowse}
                >
                  Browse
                </button>
              </p>
              <p>PNG,JPG,SVG up to {formatBytes(maxSize)}</p>
            </div>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={handleBrowse}
            >
              <UploadIcon className='mr-2 h-4 w-4' />
              Select file
            </Button>
          </div>
        )}
      </div>

      {errors.length > 0 ? (
        <div className='text-destructive space-y-1 text-xs'>
          {errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function SiteImage({
  onLogoImageChange,
  initialLogoFiles
}: SiteImageProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base font-semibold'>Site Images</CardTitle>
        <CardDescription>
          The logo and brand imagery that appear across your site.
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className='space-y-6'>
        <ImageUploadField
          title='Site Logo'
          description='Recommended at least 512 × 512px with transparent background.'
          settingKey={`setting("site_logo")`}
          accept='image/png,image/jpeg,image/svg+xml'
          maxSize={3 * 1024 * 1024}
          onChange={onLogoImageChange}
          initialFiles={initialLogoFiles}
          key={initialLogoFiles?.[0]?.id ?? 'site-logo-field'}
        />
      </CardContent>
    </Card>
  );
}
