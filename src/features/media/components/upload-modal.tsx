'use client';

import type React from 'react';

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Upload,
  X,
  FileImage,
  FileVideo,
  FileText,
  File,
  CheckCircle2
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
}

export function UploadModal({ open, onOpenChange }: UploadModalProps) {
  const [uploads, setUploads] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFiles = (files: File[]) => {
    const newUploads: UploadFile[] = files.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      progress: 0,
      status: 'uploading'
    }));

    setUploads((prev) => [...prev, ...newUploads]);

    // Simulate upload progress
    newUploads.forEach((upload) => {
      simulateUpload(upload.id);
    });
  };

  const simulateUpload = (id: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploads((prev) =>
          prev.map((u) =>
            u.id === id ? { ...u, progress: 100, status: 'complete' } : u
          )
        );
      } else {
        setUploads((prev) =>
          prev.map((u) => (u.id === id ? { ...u, progress } : u))
        );
      }
    }, 500);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImage className='h-8 w-8' />;
    if (type.startsWith('video/')) return <FileVideo className='h-8 w-8' />;
    if (type === 'application/pdf') return <FileText className='h-8 w-8' />;
    return <File className='h-8 w-8' />;
  };

  const removeUpload = (id: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            Drag and drop files here or click to browse. Supports images,
            videos, PDFs, and documents.
          </DialogDescription>
        </DialogHeader>

        {/* Drop Zone */}
        <div
          className={`relative rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border bg-muted/30'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <Upload className='text-muted-foreground mx-auto h-12 w-12' />
          <h3 className='mt-4 text-lg font-semibold'>
            {isDragging ? 'Drop files here' : 'Drag & drop files here'}
          </h3>
          <p className='text-muted-foreground mt-2 text-sm'>or</p>
          <Button
            className='mt-4'
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.multiple = true;
              input.accept = 'image/*,video/*,application/pdf,.doc,.docx';
              input.onchange = (e) => {
                const files = Array.from(
                  (e.target as HTMLInputElement).files || []
                );
                handleFiles(files);
              };
              input.click();
            }}
          >
            Browse Files
          </Button>
        </div>

        {/* Upload Progress */}
        {uploads.length > 0 && (
          <div className='mt-4 max-h-[300px] space-y-3 overflow-auto'>
            {uploads.map((upload) => (
              <div
                key={upload.id}
                className='border-border bg-card flex items-center gap-3 rounded-lg border p-3'
              >
                <div className='text-muted-foreground'>
                  {getFileIcon(upload.file.type)}
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-medium'>
                    {upload.file.name}
                  </p>
                  <div className='mt-1 flex items-center gap-2'>
                    <Progress value={upload.progress} className='flex-1' />
                    <span className='text-muted-foreground text-xs'>
                      {Math.round(upload.progress)}%
                    </span>
                  </div>
                </div>
                {upload.status === 'complete' ? (
                  <CheckCircle2 className='h-5 w-5 text-green-500' />
                ) : (
                  <Button
                    size='sm'
                    variant='ghost'
                    onClick={() => removeUpload(upload.id)}
                  >
                    <X className='h-4 w-4' />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {uploads.some((u) => u.status === 'complete') && (
          <div className='mt-4 flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setUploads([])}>
              Clear
            </Button>
            <Button
              onClick={() => {
                onOpenChange(false);
                setUploads([]);
              }}
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
