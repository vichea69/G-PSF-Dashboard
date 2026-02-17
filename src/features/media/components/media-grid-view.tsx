'use client';

import { useState } from 'react';
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
  type MediaFile,
  type MediaFolder
} from '@/features/media/types/media-type';
import Image from 'next/image';
import { MediaFolderStructure } from '@/features/media/components/media-folder-structure';

interface MediaGridViewProps {
  folders?: MediaFolder[];
  selectedFolders: Set<string>;
  onToggleFolderSelection: (folderId: string) => void;
  onOpenFolder?: (folder: MediaFolder) => void;
  files: MediaFile[];
  selectedFiles: Set<string>;
  onToggleSelection: (fileId: string) => void;
  onPreview: (file: MediaFile) => void;
  onDelete: (file: MediaFile) => void;
  deletingIds?: Set<string>;
}

export function MediaGridView({
  folders = [],
  selectedFolders,
  onToggleFolderSelection,
  onOpenFolder,
  files,
  selectedFiles,
  onToggleSelection,
  onPreview,
  onDelete,
  deletingIds
}: MediaGridViewProps) {
  return (
    <div className='p-6'>
      <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
        <MediaFolderStructure
          folders={folders}
          selectedFolders={selectedFolders}
          onToggleFolderSelection={onToggleFolderSelection}
          onOpenFolder={onOpenFolder}
        />
        {files.map((file) => (
          <MediaGridItem
            key={file.id}
            file={file}
            isSelected={selectedFiles.has(file.id)}
            onToggleSelection={onToggleSelection}
            onPreview={onPreview}
            onDelete={onDelete}
            isDeleting={deletingIds?.has(file.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface MediaGridItemProps {
  file: MediaFile;
  isSelected: boolean;
  onToggleSelection: (fileId: string) => void;
  onPreview: (file: MediaFile) => void;
  onDelete: (file: MediaFile) => void;
  isDeleting?: boolean;
}

function MediaGridItem({
  file,
  isSelected,
  onToggleSelection,
  onPreview,
  onDelete,
  isDeleting
}: MediaGridItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getFileIcon = () => {
    switch (file.type) {
      case 'image':
        return <FileImage className='text-muted-foreground h-12 w-12' />;
      case 'video':
        return <FileVideo className='text-muted-foreground h-12 w-12' />;
      case 'pdf':
      case 'document':
        return <FileText className='text-muted-foreground h-12 w-12' />;
      default:
        return <File className='text-muted-foreground h-12 w-12' />;
    }
  };

  return (
    <div
      className='group border-border bg-card relative overflow-hidden rounded-lg border transition-all hover:shadow-lg'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Checkbox */}
      <div className='absolute top-2 left-2 z-10'>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelection(file.id)}
          className='bg-background shadow-md'
        />
      </div>

      {/* Thumbnail */}
      <div className='bg-muted relative aspect-square'>
        {(file.type === 'image' || file.type === 'pdf') && file.thumbnail ? (
          <Image
            src={file.thumbnail || '/placeholder.svg'}
            alt={file.name}
            fill
            className='object-cover'
            unoptimized
          />
        ) : (
          <div className='flex h-full items-center justify-center'>
            {getFileIcon()}
          </div>
        )}

        {/* Hover Overlay */}
        {isHovered && (
          <div className='bg-background/80 absolute inset-0 flex items-center justify-center gap-2 backdrop-blur-sm transition-all'>
            <Button
              size='sm'
              variant='secondary'
              onClick={() => onPreview(file)}
            >
              <Eye className='h-4 w-4' />
            </Button>
            <Button
              size='sm'
              variant='destructive'
              disabled={isDeleting}
              onClick={() => onDelete(file)}
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
        )}
      </div>

      {/* File Info */}
      <div className='p-3'>
        <p className='text-foreground truncate text-sm font-medium'>
          {file.name}
        </p>
        <p className='text-muted-foreground mt-1 text-xs'>
          {formatFileSize(file.size)}
        </p>
      </div>
    </div>
  );
}
