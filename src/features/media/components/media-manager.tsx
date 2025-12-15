'use client';
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Search, Upload, Grid3x3, List, FileImage } from 'lucide-react';
import { MediaGridView } from '@/features/media/components/media-grid-view';
import { MediaListView } from '@/features/media/components/media-list-view';
import { UploadModal } from '@/features/media/components/upload-modal';
import { PreviewModal } from '@/features/media/components/preview-modal';
import { useMedia, useDeleteMedia } from '@/features/media/hook/use-media';
import { type MediaFile } from '@/features/media/types/media-type';
import { toast } from 'sonner';
import { AlertModal } from '@/components/modal/alert-modal';

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'oldest' | 'name' | 'size';

export function MediaManager() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [confirmState, setConfirmState] = useState<{
    ids: string[];
    label: string;
  } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const {
    data: mediaFiles = [],
    isLoading,
    error,
    refetch,
    isFetching
  } = useMedia();
  const deleteMediaMutation = useDeleteMedia();
  const errorMessage =
    error instanceof Error ? error.message : 'Something went wrong';

  // Filter and sort files from API
  const filteredFiles = useMemo(
    () =>
      mediaFiles
        .filter((file) =>
          file.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
          switch (sortBy) {
            case 'newest':
              return b.uploadedAt.getTime() - a.uploadedAt.getTime();
            case 'oldest':
              return a.uploadedAt.getTime() - b.uploadedAt.getTime();
            case 'name':
              return a.name.localeCompare(b.name);
            case 'size':
              return b.size - a.size;
            default:
              return 0;
          }
        }),
    [mediaFiles, searchQuery, sortBy]
  );

  const toggleFileSelection = (fileId: string) => {
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(fileId)) {
      newSelection.delete(fileId);
    } else {
      newSelection.add(fileId);
    }
    setSelectedFiles(newSelection);
  };

  const confirmDeleteSelected = () => {
    const ids = Array.from(selectedFiles);
    if (ids.length === 0) return;
    setConfirmState({
      ids,
      label: `${ids.length} file${ids.length > 1 ? 's' : ''}`
    });
  };

  const confirmDeleteSingle = (file: MediaFile) => {
    setConfirmState({
      ids: [file.id],
      label: `"${file.name}"`
    });
  };

  const executeDelete = async () => {
    if (!confirmState) return;

    const ids = confirmState.ids;
    setDeleteLoading(true);
    setDeletingIds(new Set(ids));

    try {
      await Promise.all(ids.map((id) => deleteMediaMutation.mutateAsync(id)));
      toast.success('Media deleted successfully');

      setSelectedFiles((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete media';
      toast.error(message);
    } finally {
      setDeleteLoading(false);
      setDeletingIds(new Set());
      setConfirmState(null);
    }
  };

  return (
    <div className='bg-background flex h-screen flex-col'>
      {/* Top Toolbar */}
      <div className='border-border bg-card border-b px-6 py-4'>
        <div className='flex flex-wrap items-center gap-3'>
          {/* Search */}
          <div className='relative min-w-[240px] flex-1'>
            <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
            <Input
              type='text'
              placeholder='Search files...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='bg-background pl-9'
            />
          </div>

          {/* Upload Button */}
          <Button onClick={() => setUploadModalOpen(true)}>
            <Upload className='mr-2 h-4 w-4' />
            Upload
          </Button>

          {/* View Toggle */}
          <div className='border-border bg-background flex gap-1 rounded-lg border p-1'>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size='sm'
              onClick={() => setViewMode('grid')}
              className='h-7 px-2'
            >
              <Grid3x3 className='h-4 w-4' />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size='sm'
              onClick={() => setViewMode('list')}
              className='h-7 px-2'
            >
              <List className='h-4 w-4' />
            </Button>
          </div>

          {/* Sort Dropdown */}
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortOption)}
          >
            <SelectTrigger className='bg-background w-[140px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='newest'>Newest</SelectItem>
              <SelectItem value='oldest'>Oldest</SelectItem>
              <SelectItem value='name'>Name</SelectItem>
              <SelectItem value='size'>Size</SelectItem>
            </SelectContent>
          </Select>

          {/* Delete Selected */}
          {selectedFiles.size > 0 && (
            <Button
              variant='destructive'
              size='sm'
              onClick={confirmDeleteSelected}
              disabled={deletingIds.size > 0}
            >
              Delete ({selectedFiles.size})
            </Button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className='flex-1 overflow-auto'>
        {isLoading || isFetching ? (
          <div className='flex h-full items-center justify-center'>
            <p className='text-muted-foreground'>Loading media...</p>
          </div>
        ) : error ? (
          <div className='flex h-full items-center justify-center'>
            <div className='text-center'>
              <p className='text-destructive mb-2 text-sm'>
                Failed to load media: {errorMessage}
              </p>
              <Button variant='outline' onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className='flex h-full items-center justify-center'>
            <div className='text-center'>
              <FileImage className='text-muted-foreground mx-auto h-12 w-12' />
              <h3 className='mt-4 text-lg font-semibold'>
                No media files found
              </h3>
              <p className='text-muted-foreground mt-2 text-sm'>
                {searchQuery
                  ? 'Try adjusting your search'
                  : 'Upload your first file to get started'}
              </p>
              {!searchQuery && (
                <Button
                  className='mt-4'
                  onClick={() => setUploadModalOpen(true)}
                >
                  <Upload className='mr-2 h-4 w-4' />
                  Upload Files
                </Button>
              )}
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <MediaGridView
            files={filteredFiles}
            selectedFiles={selectedFiles}
            onToggleSelection={toggleFileSelection}
            onPreview={setPreviewFile}
            onDelete={confirmDeleteSingle}
            deletingIds={deletingIds}
          />
        ) : (
          <MediaListView
            files={filteredFiles}
            selectedFiles={selectedFiles}
            onToggleSelection={toggleFileSelection}
            onPreview={setPreviewFile}
            onDelete={confirmDeleteSingle}
            deletingIds={deletingIds}
          />
        )}
      </div>

      {/* Modals */}
      <UploadModal open={uploadModalOpen} onOpenChange={setUploadModalOpen} />
      <PreviewModal
        file={previewFile}
        open={!!previewFile}
        onOpenChange={(open) => !open && setPreviewFile(null)}
      />
      <AlertModal
        isOpen={!!confirmState}
        onClose={() => setConfirmState(null)}
        onConfirm={executeDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
