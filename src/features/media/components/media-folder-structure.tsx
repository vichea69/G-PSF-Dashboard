'use client';

import { Folder } from 'lucide-react';
import { type MediaFolder } from '@/features/media/types/media-type';
import { Checkbox } from '@/components/ui/checkbox';

type MediaFolderStructureProps = {
  folders: MediaFolder[];
  selectedFolders: Set<string>;
  onToggleFolderSelection: (folderId: string) => void;
  onOpenFolder?: (folder: MediaFolder) => void;
};

export function MediaFolderStructure({
  folders,
  selectedFolders,
  onToggleFolderSelection,
  onOpenFolder
}: MediaFolderStructureProps) {
  if (folders.length === 0) {
    return null;
  }

  return (
    <>
      {folders.map((folder) => (
        <MediaFolderCard
          key={`folder-${folder.id}`}
          folder={folder}
          isSelected={selectedFolders.has(folder.id)}
          onToggleSelection={onToggleFolderSelection}
          onOpenFolder={onOpenFolder}
        />
      ))}
    </>
  );
}

type MediaFolderCardProps = {
  folder: MediaFolder;
  isSelected: boolean;
  onToggleSelection: (folderId: string) => void;
  onOpenFolder?: (folder: MediaFolder) => void;
};

function MediaFolderCard({
  folder,
  isSelected,
  onToggleSelection,
  onOpenFolder
}: MediaFolderCardProps) {
  const openFolder = () => onOpenFolder?.(folder);

  return (
    <div
      role='button'
      tabIndex={0}
      onClick={openFolder}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openFolder();
        }
      }}
      className={`group border-border bg-card hover:border-primary/40 focus-visible:ring-primary/30 relative cursor-pointer overflow-hidden rounded-lg border text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl focus-visible:ring-2 focus-visible:outline-none ${isSelected ? 'ring-primary/40 ring-2' : ''}`}
    >
      <div
        className='absolute top-2 left-2 z-10'
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelection(folder.id)}
          className='bg-background shadow-md'
        />
      </div>

      <div className='bg-muted flex aspect-square items-center justify-center'>
        <Folder className='h-12 w-12 text-[#f59e0b] transition-transform duration-200 group-hover:scale-105' />
      </div>
      <div className='p-3'>
        <p className='text-foreground group-hover:text-primary truncate text-sm font-medium transition-colors'>
          {folder.name}
        </p>
        <p className='text-muted-foreground mt-1 text-xs'>Folder</p>
      </div>
      <span className='bg-primary/60 pointer-events-none absolute right-0 bottom-0 left-0 h-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100' />
    </div>
  );
}
