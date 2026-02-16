'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';
import ProgressUpload from '@/components/file-upload/progress-upload';
import type { FileWithPreview } from '@/hooks/use-file-upload';

type PreviewImage = {
  id: string;
  src: string;
};

type InitialFileMetadata = {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
};

type PostImagesCardProps = {
  previewImages: PreviewImage[];
  initialFiles: InitialFileMetadata[];
  onFilesChange: (files: FileWithPreview[]) => void;
};

export function PostImagesCard({
  previewImages,
  initialFiles,
  onFilesChange
}: PostImagesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-sm'>Cover Image</CardTitle>
        <CardDescription>Upload and manage cover images</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {previewImages.length > 0 ? (
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
            {previewImages.map((image) => (
              <div
                key={image.id}
                className='relative h-24 w-full overflow-hidden rounded-md border'
              >
                <img
                  src={image.src}
                  alt='Uploaded preview'
                  className='h-full w-full object-cover'
                />
              </div>
            ))}
          </div>
        ) : null}

        <div className='space-y-2'>
          <Label>Images</Label>
          <ProgressUpload
            maxFiles={10}
            multiple
            accept={'image/*'}
            maxSize={5 * 1024 * 1024}
            simulateUpload={false}
            useDefaults={false}
            initialFiles={initialFiles}
            onFilesChange={onFilesChange}
          />

          {previewImages.length === 0 ? (
            <p className='text-muted-foreground flex items-center gap-1 text-xs'>
              <Upload className='h-3 w-3' /> Optional, will appear in the
              gallery and thumbnail
            </p>
          ) : (
            <p className='text-muted-foreground text-xs'>
              Remove existing images or add more as needed
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
