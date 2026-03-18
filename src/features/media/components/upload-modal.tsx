'use client';

import type React from 'react';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { api } from '@/lib/api';
import { cn, formatBytes } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import {
  CheckCircle2,
  File as FileIcon,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  LoaderCircle,
  RefreshCw,
  TriangleAlert,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslate } from '@/hooks/use-translate';

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderId?: string | null;
}

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  uploadedBytes: number;
  totalBytes: number;
  status: 'uploading' | 'complete' | 'error';
  error?: string;
}

const ACCEPTED_FILE_TYPES = 'image/*,video/*,application/pdf,.doc,.docx';

const createUploadId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

function normalizeFolderId(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function getClientAuthHeaders(): Record<string, string> {
  if (typeof document === 'undefined') return {};

  const accessTokenCookie = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith('access_token='));
  const encodedToken = accessTokenCookie?.split('=').slice(1).join('=');
  const token = encodedToken ? decodeURIComponent(encodedToken) : '';

  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function UploadModal({
  open,
  onOpenChange,
  folderId
}: UploadModalProps) {
  const { t } = useTranslate();
  const targetFolderId = normalizeFolderId(folderId);
  const uploadEndpoint = targetFolderId
    ? `/media/upload/folders/${encodeURIComponent(targetFolderId)}`
    : '/media/upload';
  const [uploads, setUploads] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const queryClient = useQueryClient();
  const progressTimers = useRef<Map<string, ReturnType<typeof setInterval>>>(
    new Map()
  );
  const requestControllers = useRef<Map<string, AbortController>>(new Map());

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

  const clearUploadRequest = useCallback((id: string) => {
    requestControllers.current.delete(id);
  }, []);

  const cancelUploadRequest = useCallback((id: string) => {
    const controller = requestControllers.current.get(id);
    if (controller) {
      controller.abort();
      requestControllers.current.delete(id);
    }
  }, []);

  const clearAllUploadRequests = useCallback(() => {
    requestControllers.current.forEach((controller) => controller.abort());
    requestControllers.current.clear();
  }, []);

  const updateUploadProgress = useCallback((id: string, progress: number) => {
    setUploads((prev) =>
      prev.map((upload) =>
        upload.id === id
          ? {
              ...upload,
              progress: Math.min(100, Math.max(progress, upload.progress))
            }
          : upload
      )
    );
  }, []);

  const uploadFile = useCallback(
    async (upload: UploadFile): Promise<boolean> => {
      clearProgressTimer(upload.id);
      cancelUploadRequest(upload.id);

      const controller = new AbortController();
      requestControllers.current.set(upload.id, controller);

      const timer = setInterval(() => {
        setUploads((prev) =>
          prev.map((item) => {
            if (item.id !== upload.id || item.status !== 'uploading') {
              return item;
            }

            const nextProgress = Math.min(95, item.progress + 3);
            const nextUploadedBytes = item.totalBytes
              ? Math.min(
                  item.totalBytes,
                  Math.round((item.totalBytes * nextProgress) / 100)
                )
              : item.uploadedBytes;

            return {
              ...item,
              progress: nextProgress,
              uploadedBytes: Math.max(item.uploadedBytes, nextUploadedBytes)
            };
          })
        );
      }, 450);

      progressTimers.current.set(upload.id, timer);

      setUploads((prev) =>
        prev.map((item) =>
          item.id === upload.id
            ? {
                ...item,
                status: 'uploading',
                progress: item.progress || 1,
                uploadedBytes: item.uploadedBytes || 0,
                totalBytes: item.totalBytes || item.file.size || 0,
                error: undefined
              }
            : item
        )
      );

      const formData = new FormData();
      formData.append('files', upload.file);

      try {
        await api.post(uploadEndpoint, formData, {
          signal: controller.signal,
          withCredentials: true,
          headers: {
            ...getClientAuthHeaders(),
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (event) => {
            clearProgressTimer(upload.id);

            const total = event.total ?? upload.file.size ?? 0;
            const loaded = Math.min(
              event.loaded ?? 0,
              total || event.loaded || 0
            );
            const nextProgress =
              total > 0
                ? Math.round((loaded * 100) / total)
                : Math.min(99, upload.progress + 5);

            setUploads((prev) =>
              prev.map((item) =>
                item.id === upload.id
                  ? {
                      ...item,
                      progress: Math.max(item.progress, nextProgress),
                      uploadedBytes: Math.max(item.uploadedBytes, loaded),
                      totalBytes: total || item.totalBytes
                    }
                  : item
              )
            );
          }
        });

        clearProgressTimer(upload.id);
        clearUploadRequest(upload.id);
        updateUploadProgress(upload.id, 100);

        setUploads((prev) =>
          prev.map((item) =>
            item.id === upload.id
              ? {
                  ...item,
                  progress: 100,
                  uploadedBytes: item.totalBytes || item.file.size || 0,
                  totalBytes: item.totalBytes || item.file.size || 0,
                  status: 'complete',
                  error: undefined
                }
              : item
          )
        );

        toast.success(`${upload.file.name} ${t('media.upload.uploaded')}`);
        void queryClient.invalidateQueries({ queryKey: ['media'] });
        return true;
      } catch (error: unknown) {
        clearProgressTimer(upload.id);
        clearUploadRequest(upload.id);

        if (isAxiosError(error) && error.code === 'ERR_CANCELED') {
          return false;
        }

        const message = isAxiosError(error)
          ? ((error.response?.data as any)?.message ??
            (error.response?.data as any)?.error ??
            error.message)
          : error instanceof Error
            ? error.message
            : t('media.upload.uploadFailed');

        setUploads((prev) =>
          prev.map((item) =>
            item.id === upload.id
              ? { ...item, status: 'error', error: message }
              : item
          )
        );

        toast.error(message);
        return false;
      }
    },
    [
      cancelUploadRequest,
      clearProgressTimer,
      clearUploadRequest,
      queryClient,
      t,
      updateUploadProgress,
      uploadEndpoint
    ]
  );

  const openFilePicker = useCallback(
    (
      onFilesSelected: (files: File[]) => void,
      options?: { multiple?: boolean }
    ) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = options?.multiple ?? true;
      input.accept = ACCEPTED_FILE_TYPES;
      input.onchange = (event) => {
        const files = Array.from(
          (event.target as HTMLInputElement).files || []
        );
        onFilesSelected(files);
      };
      input.click();
    },
    []
  );

  const handleFiles = useCallback(
    (files: File[]) => {
      if (!files.length) return;

      const newUploads: UploadFile[] = files.map((file) => ({
        id: createUploadId(),
        file,
        progress: 0,
        uploadedBytes: 0,
        totalBytes: file.size || 0,
        status: 'uploading'
      }));

      setUploads((prev) => [...prev, ...newUploads]);
      newUploads.forEach((upload) => {
        void uploadFile(upload);
      });
    },
    [uploadFile]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);
      handleFiles(Array.from(event.dataTransfer.files));
    },
    [handleFiles]
  );

  const retryUpload = useCallback(
    (id: string) => {
      const currentUpload = uploads.find((upload) => upload.id === id);
      if (!currentUpload) return;

      const nextUpload: UploadFile = {
        ...currentUpload,
        progress: 0,
        uploadedBytes: 0,
        totalBytes: currentUpload.file.size || 0,
        status: 'uploading',
        error: undefined
      };

      setUploads((prev) =>
        prev.map((upload) => (upload.id === id ? nextUpload : upload))
      );
      void uploadFile(nextUpload);
    },
    [uploadFile, uploads]
  );

  const clearUploads = useCallback(() => {
    clearAllProgressTimers();
    clearAllUploadRequests();
    setUploads([]);
  }, [clearAllProgressTimers, clearAllUploadRequests]);

  useEffect(() => {
    return () => {
      clearAllProgressTimers();
      clearAllUploadRequests();
    };
  }, [clearAllProgressTimers, clearAllUploadRequests]);

  const hasActiveUploads = uploads.some(
    (upload) => upload.status === 'uploading'
  );

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <FileImage className='h-8 w-8' />;
    if (type.startsWith('video/')) return <FileVideo className='h-8 w-8' />;
    if (type === 'application/pdf') return <FileText className='h-8 w-8' />;
    if (type.includes('sheet') || type.includes('excel'))
      return <FileSpreadsheet className='h-8 w-8' />;
    if (type.includes('zip') || type.includes('rar'))
      return <FileArchive className='h-8 w-8' />;
    return <FileIcon className='h-8 w-8' />;
  };

  const getProgressColor = (status: UploadFile['status']) => {
    if (status === 'complete') return 'bg-green-600';
    if (status === 'error') return 'bg-destructive';
    return 'bg-orange-500';
  };

  const getProgressText = (upload: UploadFile) => {
    const totalBytes = upload.totalBytes || upload.file.size || 0;
    const uploadedBytes =
      upload.status === 'complete'
        ? totalBytes
        : Math.min(upload.uploadedBytes, totalBytes || upload.uploadedBytes);

    return `${formatBytes(uploadedBytes, { decimals: 1 })} of ${formatBytes(
      totalBytes,
      { decimals: 1 }
    )}`;
  };

  const getStatusContent = (upload: UploadFile) => {
    if (upload.status === 'complete') {
      return (
        <span className='inline-flex items-center gap-1 text-xs font-medium text-green-600'>
          <CheckCircle2 className='h-3.5 w-3.5' />
          {t('media.upload.done')}
        </span>
      );
    }

    if (upload.status === 'error') {
      return (
        <span className='text-destructive inline-flex items-center gap-1 text-xs font-medium'>
          <TriangleAlert className='h-3.5 w-3.5' />
          {t('media.upload.failed')}
        </span>
      );
    }

    return (
      <span className='text-muted-foreground inline-flex items-center gap-1 text-xs font-medium'>
        <LoaderCircle className='h-3 w-3 animate-spin' />
        {Math.round(upload.progress)}%
      </span>
    );
  };

  const handleDialogChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      clearUploads();
    }

    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className='max-w-[calc(100vw-1rem)] p-4 sm:max-w-xl sm:p-5'>
        <DialogHeader>
          <DialogTitle>{t('media.upload.title')}</DialogTitle>
          <DialogDescription className='text-sm leading-5'>
            {t('media.upload.description')}{' '}
            {targetFolderId ? t('media.upload.descriptionInFolder') : ''}
          </DialogDescription>
        </DialogHeader>

        <div
          className={cn(
            'relative rounded-lg border-2 border-dashed p-5 text-center transition-colors sm:p-8',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border bg-muted/30'
          )}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <Upload className='text-muted-foreground mx-auto h-8 w-8 sm:h-10 sm:w-10' />
          <h3 className='mt-3 text-sm font-semibold sm:text-base'>
            {isDragging
              ? t('media.upload.dropHere')
              : t('media.upload.dragAndDrop')}
          </h3>
          <p className='text-muted-foreground mt-1.5 text-xs sm:text-sm'>
            {t('media.upload.or')}
          </p>
          <Button
            size='sm'
            className='mt-3 w-full sm:w-auto'
            onClick={() => openFilePicker(handleFiles)}
          >
            {t('media.upload.browseFiles')}
          </Button>
        </div>

        {uploads.length > 0 && (
          <div className='mt-3 max-h-[50vh] space-y-2 overflow-auto'>
            {uploads.map((upload) => (
              <div
                key={upload.id}
                className='border-border bg-card rounded-lg border p-3'
              >
                <div className='flex items-start gap-3'>
                  <div className='border-border bg-muted/40 text-muted-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border'>
                    {getFileIcon(upload.file.type)}
                  </div>

                  <div className='min-w-0 flex-1 space-y-2'>
                    <div className='flex items-start justify-between gap-2'>
                      <p className='truncate text-sm font-medium'>
                        {upload.file.name}
                      </p>
                      {getStatusContent(upload)}
                    </div>

                    <Progress
                      value={upload.progress}
                      className='h-1.5'
                      indicatorClassName={getProgressColor(upload.status)}
                    />

                    <div className='flex items-center justify-between gap-2'>
                      <div className='min-w-0'>
                        <p className='text-muted-foreground text-xs'>
                          {getProgressText(upload)}
                        </p>
                        {upload.status === 'error' && upload.error && (
                          <p className='text-destructive mt-1 truncate text-xs'>
                            {upload.error}
                          </p>
                        )}
                      </div>

                      {upload.status === 'error' && (
                        <div className='shrink-0'>
                          <Button
                            size='sm'
                            variant='outline'
                            className='h-7 px-2 text-xs'
                            onClick={() => retryUpload(upload.id)}
                          >
                            <RefreshCw className='h-3.5 w-3.5' />
                            {t('media.upload.retry')}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className='mt-3 flex flex-col gap-2 border-t pt-3 sm:flex-row sm:items-center sm:justify-between'>
          <p className='text-muted-foreground text-xs'>
            {uploads.length === 0
              ? t('media.upload.idleHint')
              : hasActiveUploads
                ? t('media.upload.uploadingState')
                : t('media.upload.completeState')}
          </p>

          <div className='flex items-center justify-end gap-2'>
            <Button
              variant={uploads.length > 0 ? 'primary' : 'outline'}
              size='sm'
              className='w-full sm:w-auto'
              onClick={() => handleDialogChange(false)}
              disabled={hasActiveUploads}
            >
              {t('media.upload.close')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
