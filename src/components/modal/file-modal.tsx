'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useMedia } from '@/features/media/hook/use-media';
import type { MediaFile, MediaFolder } from '@/features/media/types/media-type';
import Image from 'next/image';
import { ArrowLeft, Folder } from 'lucide-react';

interface FileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (file: MediaFile) => void;
  onUploadFromDevice?: (files: File[], folderId?: string | null) => void;
  loading?: boolean;
  title?: string;
  description?: string;
  types?: MediaFile['type'][];
  accept?: string;
  multiple?: boolean;
  allowUploadFromDevice?: boolean;
}

export const FileModal: React.FC<FileModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  onUploadFromDevice,
  loading = false,
  title = 'Insert file',
  description = 'Upload a new file or pick from Media Manager.',
  types = ['image', 'video', 'pdf', 'document'],
  accept = '*/*',
  multiple = false,
  allowUploadFromDevice = true
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [mediaSearch, setMediaSearch] = useState('');
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data, isLoading: mediaLoading } = useMedia({
    page,
    pageSize,
    folderId: activeFolderId
  });
  const folders = useMemo(() => data?.folders ?? [], [data?.folders]);
  const currentFolder = data?.currentFolder ?? null;
  const inFolderView = Boolean(activeFolderId);
  const mediaFiles = useMemo(() => data?.items ?? [], [data?.items]);
  const total = data?.total ?? mediaFiles.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setMediaSearch('');
      setSelectedMediaId(null);
      setActiveFolderId(null);
      setPage(1);
    }
  }, [isOpen]);

  useEffect(() => {
    setPage(1);
  }, [mediaSearch, activeFolderId]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const filteredFiles = useMemo(() => {
    const term = mediaSearch.trim().toLowerCase();
    const typeSet = types?.length ? new Set(types) : null;
    return mediaFiles
      .filter((file) => (typeSet ? typeSet.has(file.type) : true))
      .filter((file) => (term ? file.name.toLowerCase().includes(term) : true));
  }, [mediaFiles, mediaSearch, types]);

  const filteredFolders = useMemo(() => {
    if (inFolderView) return [];
    const term = mediaSearch.trim().toLowerCase();
    return folders.filter((folder) =>
      term ? folder.name.toLowerCase().includes(term) : true
    );
  }, [folders, inFolderView, mediaSearch]);

  const resolvedFolder =
    currentFolder ??
    folders.find((folder) => folder.id === activeFolderId) ??
    null;

  useEffect(() => {
    if (!selectedMediaId) return;
    const stillExists = filteredFiles.some(
      (file) => file.id === selectedMediaId
    );
    if (!stillExists) {
      setSelectedMediaId(null);
    }
  }, [filteredFiles, selectedMediaId]);

  const selectedMedia = useMemo(() => {
    if (!selectedMediaId) return null;
    return filteredFiles.find((file) => file.id === selectedMediaId) ?? null;
  }, [filteredFiles, selectedMediaId]);

  const handleUploadFromDevice = () => {
    if (!allowUploadFromDevice) return;
    inputRef.current?.click();
  };

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    if (!onUploadFromDevice) return;
    onUploadFromDevice(files, activeFolderId);
    event.target.value = '';
    onClose();
  };

  const handleInsertSelected = () => {
    if (!selectedMedia) return;
    onSelect(selectedMedia);
    onClose();
  };

  const openFolder = (folder: MediaFolder) => {
    setActiveFolderId(folder.id);
    setSelectedMediaId(null);
  };

  const backToAllMedia = () => {
    setActiveFolderId(null);
    setSelectedMediaId(null);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <Modal
      title={title}
      description={description}
      isOpen={isOpen}
      onClose={onClose}
      contentClassName='max-w-5xl w-[95vw]'
    >
      <div className='space-y-4'>
        {allowUploadFromDevice ? (
          <div className='flex flex-wrap items-center gap-2'>
            <Button onClick={handleUploadFromDevice} disabled={loading}>
              Upload from device
            </Button>
            <input
              ref={inputRef}
              type='file'
              accept={accept}
              multiple={multiple}
              className='hidden'
              onChange={handleFilesSelected}
            />
          </div>
        ) : null}

        <div className='space-y-2'>
          <div className='flex flex-wrap items-center gap-2'>
            {inFolderView ? (
              <Button
                type='button'
                size='sm'
                variant='outline'
                onClick={backToAllMedia}
              >
                <ArrowLeft className='mr-1 h-4 w-4' />
                All Media
              </Button>
            ) : null}
            {inFolderView ? (
              <p className='text-muted-foreground text-xs'>
                Folder:{' '}
                <span className='text-foreground font-medium'>
                  {resolvedFolder?.name ?? 'Selected Folder'}
                </span>
              </p>
            ) : null}
          </div>

          <Input
            placeholder='Search media...'
            value={mediaSearch}
            onChange={(event) => setMediaSearch(event.target.value)}
          />
          <div className='border-muted max-h-[360px] overflow-auto rounded-md border p-3'>
            {mediaLoading ? (
              <p className='text-muted-foreground text-sm'>Loading media...</p>
            ) : filteredFiles.length === 0 && filteredFolders.length === 0 ? (
              <p className='text-muted-foreground text-sm'>
                {inFolderView
                  ? 'No files found in this folder.'
                  : 'No files found.'}
              </p>
            ) : (
              <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'>
                {filteredFolders.map((folder) => (
                  <button
                    key={`folder-${folder.id}`}
                    type='button'
                    className='border-muted hover:border-primary flex h-[172px] w-full flex-col overflow-hidden rounded-md border text-left transition'
                    onClick={() => openFolder(folder)}
                  >
                    <div className='bg-muted flex h-[136px] w-full items-center justify-center'>
                      <Folder className='h-10 w-10 text-[#f59e0b]' />
                    </div>
                    <div className='bg-background/80 text-foreground mt-auto truncate px-2 py-2 text-xs font-medium'>
                      {folder.name}
                    </div>
                  </button>
                ))}

                {filteredFiles.map((file) => {
                  const previewUrl = file.thumbnail ?? file.url;
                  const showThumbnail =
                    (file.type === 'image' || file.type === 'pdf') &&
                    Boolean(file.thumbnail);
                  return (
                    <button
                      key={file.id}
                      type='button'
                      className={cn(
                        'border-muted hover:border-primary flex h-[172px] w-full flex-col overflow-hidden rounded-md border text-left transition',
                        selectedMediaId === file.id &&
                          'border-primary ring-primary/30 ring-2'
                      )}
                      onClick={() => setSelectedMediaId(file.id)}
                    >
                      {showThumbnail ? (
                        <div className='bg-muted relative h-[136px] w-full'>
                          <Image
                            src={previewUrl}
                            alt={file.name}
                            fill
                            className='object-contain p-1'
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className='text-muted-foreground bg-muted flex h-[136px] w-full items-center justify-center text-xs'>
                          {file.type.toUpperCase()}
                        </div>
                      )}
                      <div className='bg-background/80 text-foreground mt-auto truncate px-2 py-2 text-xs'>
                        {file.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {!mediaLoading ? (
            <div className='flex flex-wrap items-center justify-between gap-2 pt-2'>
              <p className='text-muted-foreground text-xs'>
                Total {total} file{total === 1 ? '' : 's'}
              </p>
              <div className='flex items-center gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page <= 1}
                >
                  Prev
                </Button>
                <span className='text-muted-foreground text-xs'>
                  Page {page} of {totalPages}
                </span>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    setPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-muted-foreground text-xs'>Rows</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(value) => {
                    setPageSize(Number(value));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className='h-8 w-[90px]'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='10'>10</SelectItem>
                    <SelectItem value='20'>20</SelectItem>
                    <SelectItem value='40'>40</SelectItem>
                    <SelectItem value='80'>80</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className='flex w-full items-center justify-end space-x-2 pt-6'>
        <Button disabled={loading} variant='outline' onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleInsertSelected}
          disabled={loading || !selectedMedia}
        >
          Insert selected
        </Button>
      </div>
    </Modal>
  );
};
