'use client';

import type React from 'react';

import { useCallback, useRef, useState } from 'react';
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
  File as FileIcon,
  CheckCircle2
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { uploadMedia } from '@/server/action/media/media';

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderId?: string | null;
}

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
}

const createUploadId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

function normalizeFolderId(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function UploadModal({
  open,
  onOpenChange,
  folderId
}: UploadModalProps) {
  const targetFolderId = normalizeFolderId(folderId);
  const [uploads, setUploads] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const progressTimers = useRef<Map<string, ReturnType<typeof setInterval>>>(
    new Map()
  );

  const clearProgressTimer = useCallback((id: string) => {
    const timer = progressTimers.current.get(id);
    if (timer) {
      clearInterval(timer);
      progressTimers.current.delete(id);
    }
  }, []);

  const clearAllProgressTimers = useCallback(() => {
    progressTimers.current.forEach((timer) => clearInterval(timer));
    progressTimers.current.clear();
  }, []);

  const updateUploadProgress = useCallback((id: string, progress: number) => {
    setUploads((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, progress: Math.min(100, Math.max(progress, u.progress)) }
          : u
      )
    );
  }, []);

  const uploadFile = useCallback(
    async (upload: UploadFile): Promise<boolean> => {
      clearProgressTimer(upload.id);
      const timer = setInterval(() => {
        setUploads((prev) =>
          prev.map((u) =>
            u.id === upload.id
              ? { ...u, progress: Math.min(95, u.progress + 3) }
              : u
          )
        );
      }, 500);
      progressTimers.current.set(upload.id, timer);

      setUploads((prev) =>
        prev.map((u) =>
          u.id === upload.id
            ? {
                ...u,
                status: 'uploading',
                progress: u.progress || 1,
                error: undefined
              }
            : u
        )
      );

      const formData = new FormData();
      formData.append('files', upload.file);

      try {
        const result = await uploadMedia(formData, {
          folderId: targetFolderId
        });
        if (!result.success) {
          throw new Error(result.error || 'Failed to upload file');
        }

        clearProgressTimer(upload.id);
        updateUploadProgress(upload.id, 100);

        setUploads((prev) =>
          prev.map((u) =>
            u.id === upload.id
              ? { ...u, progress: 100, status: 'complete', error: undefined }
              : u
          )
        );

        toast.success(`${upload.file.name} uploaded`);
        void queryClient.invalidateQueries({ queryKey: ['media'] });
        return true;
      } catch (error: unknown) {
        clearProgressTimer(upload.id);
        const message =
          error instanceof Error ? error.message : 'Failed to upload file';

        setUploads((prev) =>
          prev.map((u) =>
            u.id === upload.id ? { ...u, status: 'error', error: message } : u
          )
        );

        toast.error(message);
        return false;
      }
    },
    [clearProgressTimer, queryClient, targetFolderId, updateUploadProgress]
  );

  const handleFiles = useCallback((files: File[]) => {
    if (!files.length) return;

    const newUploads: UploadFile[] = files.map((file) => ({
      id: createUploadId(),
      file,
      progress: 0,
      status: 'pending'
    }));

    setUploads((prev) => [...prev, ...newUploads]);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    },
    [handleFiles]
  );

  const handleSubmitUploads = useCallback(async () => {
    const pending = uploads.filter(
      (u) => u.status === 'pending' || u.status === 'error'
    );

    if (pending.length === 0) {
      onOpenChange(false);
      clearAllProgressTimers();
      setUploads([]);
      return;
    }

    setIsSubmitting(true);
    const results = await Promise.all(pending.map((u) => uploadFile(u)));
    setIsSubmitting(false);
    clearAllProgressTimers();

    const hasError = results.some((r) => r === false);
    if (!hasError) {
      onOpenChange(false);
      setUploads([]);
    }
  }, [clearAllProgressTimers, onOpenChange, uploadFile, uploads]);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImage className='h-8 w-8' />;
    if (type.startsWith('video/')) return <FileVideo className='h-8 w-8' />;
    if (type === 'application/pdf') return <FileText className='h-8 w-8' />;
    return <FileIcon className='h-8 w-8' />;
  };

  const removeUpload = (id: string) => {
    clearProgressTimer(id);
    setUploads((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            Drag and drop files here or click to browse. Supports images,
            videos, PDFs, and documents.{' '}
            {targetFolderId ? 'Files will be uploaded to this folder.' : ''}
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
                  {upload.status === 'error' && upload.error && (
                    <p className='text-destructive mt-1 truncate text-xs'>
                      {upload.error}
                    </p>
                  )}
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
        {uploads.length > 0 && (
          <div className='mt-4 flex justify-end gap-2'>
            <Button
              variant='outline'
              onClick={() => {
                clearAllProgressTimers();
                setUploads([]);
              }}
            >
              Clear
            </Button>
            <Button
              onClick={handleSubmitUploads}
              disabled={
                isSubmitting ||
                uploads.every(
                  (u) => u.status === 'complete' || u.status === 'uploading'
                )
              }
            >
              {isSubmitting ? 'Uploading...' : 'Done'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
