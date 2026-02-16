'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useMedia } from '@/features/media/hook/use-media';
import type { MediaFile } from '@/features/media/types/media-type';
import Image from 'next/image';

interface FileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (file: MediaFile) => void;
  onUploadFromDevice?: (files: File[]) => void;
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
  const inputRef = useRef<HTMLInputElement>(null);
  const { data, isLoading: mediaLoading } = useMedia();
  const mediaFiles = data?.items ?? [];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setMediaSearch('');
      setSelectedMediaId(null);
    }
  }, [isOpen]);

  const imageMedia = useMemo(() => {
    const term = mediaSearch.trim().toLowerCase();
    const typeSet = types?.length ? new Set(types) : null;
    return mediaFiles
      .filter((file) => (typeSet ? typeSet.has(file.type) : true))
      .filter((file) => (term ? file.name.toLowerCase().includes(term) : true));
  }, [mediaFiles, mediaSearch, types]);

  const selectedMedia = useMemo(() => {
    if (!selectedMediaId) return null;
    return imageMedia.find((file) => file.id === selectedMediaId) ?? null;
  }, [imageMedia, selectedMediaId]);

  const handleUploadFromDevice = () => {
    if (!allowUploadFromDevice) return;
    inputRef.current?.click();
  };

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    if (!onUploadFromDevice) return;
    onUploadFromDevice(files);
    event.target.value = '';
    onClose();
  };

  const handleInsertSelected = () => {
    if (!selectedMedia) return;
    onSelect(selectedMedia);
    onClose();
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
          <Input
            placeholder='Search media...'
            value={mediaSearch}
            onChange={(event) => setMediaSearch(event.target.value)}
          />
          <div className='border-muted max-h-[360px] overflow-auto rounded-md border p-3'>
            {mediaLoading ? (
              <p className='text-muted-foreground text-sm'>Loading media...</p>
            ) : imageMedia.length === 0 ? (
              <p className='text-muted-foreground text-sm'>No files found.</p>
            ) : (
              <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'>
                {imageMedia.map((file) => {
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
