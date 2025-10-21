'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import {
  Alert,
  AlertContent,
  AlertDescription,
  AlertIcon,
  AlertTitle
} from '@/components/ui/reui/alert';
import { Button } from '@/components/ui/reui/button';
import { Card, CardContent } from '@/components/ui/reui/card';
import { Progress } from '@/components/ui/reui/progress';
import { CircleX, CloudUpload, ImageIcon, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

interface ImageUploadProps {
  maxFiles?: number;
  maxSize?: number;
  accept?: string;
  className?: string;
  onImagesChange?: (images: ImageFile[]) => void;
  onUploadComplete?: (images: ImageFile[]) => void;
}

export default function ImageUpload({
  maxFiles = 10,
  maxSize = 8 * 1024 * 1024, // 8MB
  accept = 'image/*',
  className,
  onImagesChange,
  onUploadComplete
}: ImageUploadProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'File must be an image';
    }
    if (file.size > maxSize) {
      return `File size must be less than ${(maxSize / 1024 / 1024).toFixed(1)}MB`;
    }
    if (images.length >= maxFiles) {
      return `Maximum ${maxFiles} files allowed`;
    }
    return null;
  };

  const addImages = useCallback(
    (files: FileList | File[]) => {
      const newImages: ImageFile[] = [];
      const newErrors: string[] = [];

      Array.from(files).forEach((file) => {
        const error = validateFile(file);
        if (error) {
          newErrors.push(`${file.name}: ${error}`);
          return;
        }

        const imageFile: ImageFile = {
          id: `${Date.now()}-${Math.random()}`,
          file,
          preview: URL.createObjectURL(file),
          progress: 0,
          status: 'uploading'
        };

        newImages.push(imageFile);
      });

      if (newErrors.length > 0) {
        setErrors((prev) => [...prev, ...newErrors]);
      }

      if (newImages.length > 0) {
        const updatedImages = [...images, ...newImages];
        setImages(updatedImages);
        onImagesChange?.(updatedImages);

        // Simulate upload progress
        newImages.forEach((imageFile) => simulateUpload(imageFile));
      }
    },
    [images, maxFiles, maxSize, onImagesChange]
  );

  const simulateUpload = (imageFile: ImageFile) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);

        setImages((prev) =>
          prev.map((img) =>
            img.id === imageFile.id
              ? { ...img, progress: 100, status: 'completed' as const }
              : img
          )
        );

        const updatedImages = images.map((img) =>
          img.id === imageFile.id
            ? { ...img, progress: 100, status: 'completed' as const }
            : img
        );

        if (updatedImages.every((img) => img.status === 'completed')) {
          onUploadComplete?.(updatedImages);
        }
      } else {
        setImages((prev) =>
          prev.map((img) =>
            img.id === imageFile.id ? { ...img, progress } : img
          )
        );
      }
    }, 100);
  };

  const removeImage = useCallback((id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) addImages(files);
    },
    [addImages]
  );

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const openFileDialog = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = accept;
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) addImages(target.files);
    };
    input.click();
  }, [accept, addImages]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className={cn('w-full max-w-4xl', className)}>
      {/* Uploaded Image Grid */}
      {images.length > 0 && (
        <div className='mb-6 grid grid-cols-4 gap-2.5'>
          {images.map((imageFile, index) => (
            <Card
              key={imageFile.id}
              className='bg-accent/50 group relative flex shrink-0 items-center justify-center rounded-md shadow-none'
            >
              <Image
                src={imageFile.preview}
                alt={`Uploaded image ${index + 1}`}
                width={400}
                height={300}
                className='h-[120px] w-full rounded-md object-cover'
              />
              <Button
                onClick={() => removeImage(imageFile.id)}
                variant='outline'
                size='icon'
                className='absolute top-2 right-2 size-6 rounded-full opacity-0 shadow-sm group-hover:opacity-100'
              >
                <CircleX className='size-3.5' />
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dropzone */}
      <Card
        className={cn(
          'rounded-md border-dashed shadow-none transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <CardContent className='text-center'>
          <div className='border-border mx-auto mb-3 flex size-[32px] items-center justify-center rounded-full border'>
            <CloudUpload className='size-4' />
          </div>
          <h3 className='text-2sm text-foreground mb-0.5 font-semibold'>
            Choose a file or drag & drop here.
          </h3>
          <span className='text-secondary-foreground mb-3 block text-xs font-normal'>
            JPEG, PNG, up to {formatBytes(maxSize)}.
          </span>
          <Button size='sm' variant='mono' onClick={openFileDialog}>
            Browse File
          </Button>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {images.length > 0 && (
        <div className='mt-6 space-y-3'>
          {images.map((imageFile) => (
            <Card key={imageFile.id} className='rounded-md shadow-none'>
              <CardContent className='flex items-center gap-2 p-3'>
                <div className='border-border flex size-[32px] shrink-0 items-center justify-center rounded-md border'>
                  <ImageIcon className='text-muted-foreground size-4' />
                </div>
                <div className='flex w-full flex-col gap-1.5'>
                  <div className='-mt-2 flex w-full items-center justify-between gap-2.5'>
                    <div className='flex items-center gap-2.5'>
                      <span className='text-foreground text-xs leading-none font-medium'>
                        {imageFile.file.name}
                      </span>
                      <span className='text-muted-foreground text-xs leading-none font-normal'>
                        {formatBytes(imageFile.file.size)}
                      </span>
                      {imageFile.status === 'uploading' && (
                        <p className='text-muted-foreground text-xs'>
                          Uploading... {Math.round(imageFile.progress)}%
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => removeImage(imageFile.id)}
                      variant='ghost'
                      size='icon'
                      className='size-6'
                    >
                      <CircleX className='size-3.5' />
                    </Button>
                  </div>

                  <Progress
                    value={imageFile.progress}
                    className={cn(
                      'h-1 transition-all duration-300',
                      '[&>div]:bg-zinc-950 dark:[&>div]:bg-zinc-50'
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <Alert variant='destructive' appearance='light' className='mt-5'>
          <AlertIcon>
            <TriangleAlert />
          </AlertIcon>
          <AlertContent>
            <AlertTitle>File upload error(s)</AlertTitle>
            <AlertDescription>
              {errors.map((error, index) => (
                <p key={index} className='last:mb-0'>
                  {error}
                </p>
              ))}
            </AlertDescription>
          </AlertContent>
        </Alert>
      )}
    </div>
  );
}
