'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  ArrowLeft,
  Search,
  Upload,
  Grid3x3,
  List,
  FileImage,
  FolderPlus
} from 'lucide-react';
import { MediaGridView } from '@/features/media/components/media-grid-view';
import { MediaListView } from '@/features/media/components/media-list-view';
import { UploadModal } from '@/features/media/components/upload-modal';
import { PreviewModal } from '@/features/media/components/preview-modal';
import { CreateFolderModal } from '@/features/media/components/create-folder-modal';
import {
  useMedia,
  useDeleteMedia,
  useCreateMediaFolder,
  useDeleteMediaFolder
} from '@/features/media/hook/use-media';
import {
  type MediaFile,
  type MediaFolder
} from '@/features/media/types/media-type';
import { toast } from 'sonner';
import { AlertModal } from '@/components/modal/alert-modal';

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'name' | 'size';

type MediaManagerProps = {
  folderId?: string | null;
};

function normalizeFolderId(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function MediaManager({ folderId }: MediaManagerProps = {}) {
  const router = useRouter();
  const activeFolderId = normalizeFolderId(folderId);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [selectedFolders, setSelectedFolders] = useState<Set<string>>(
    new Set()
  );
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [confirmState, setConfirmState] = useState<{
    ids: string[];
    label: string;
  } | null>(null);
  const [confirmDeleteFoldersOpen, setConfirmDeleteFoldersOpen] =
    useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { data, isLoading, error, refetch } = useMedia({
    page,
    pageSize,
    folderId: activeFolderId
  });
  const folders = useMemo<MediaFolder[]>(
    () => data?.folders ?? [],
    [data?.folders]
  );
  const currentFolder = data?.currentFolder ?? null;
  const resolvedActiveFolder =
    currentFolder ??
    folders.find((folder) => folder.id === activeFolderId) ??
    null;
  const inFolderView = Boolean(activeFolderId);
  const mediaFiles = useMemo<MediaFile[]>(
    () => data?.items ?? [],
    [data?.items]
  );
  const total = data?.total ?? mediaFiles.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const deleteMediaMutation = useDeleteMedia();
  const createFolderMutation = useCreateMediaFolder();
  const deleteFolderMutation = useDeleteMediaFolder();
  const errorMessage =
    error instanceof Error ? error.message : 'Something went wrong';

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    setSelectedFiles(new Set());
  }, [page, pageSize]);

  useEffect(() => {
    setPage(1);
    setSelectedFiles(new Set());
    setSelectedFolders(new Set());
  }, [activeFolderId]);

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
  const filteredFolders = useMemo(
    () =>
      inFolderView
        ? []
        : folders.filter((folder: MediaFolder) =>
            folder.name.toLowerCase().includes(searchQuery.toLowerCase())
          ),
    [folders, inFolderView, searchQuery]
  );

  useEffect(() => {
    setPage(1);
  }, [searchQuery, sortBy]);

  const toggleFileSelection = (fileId: string) => {
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(fileId)) {
      newSelection.delete(fileId);
    } else {
      newSelection.add(fileId);
    }
    setSelectedFiles(newSelection);
  };

  const toggleFolderSelection = (folderId: string) => {
    setSelectedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const toggleAllSelection = (checked: boolean) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (checked) {
        filteredFiles.forEach((file) => next.add(file.id));
      } else {
        filteredFiles.forEach((file) => next.delete(file.id));
      }
      return next;
    });
  };

  const confirmDeleteSelectedFolders = () => {
    if (selectedFolders.size === 0) return;
    setConfirmDeleteFoldersOpen(true);
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

  const executeDeleteSelectedFolders = async () => {
    const folderIds = Array.from(selectedFolders);
    if (folderIds.length === 0) {
      setConfirmDeleteFoldersOpen(false);
      return;
    }

    try {
      await Promise.all(
        folderIds.map((id) =>
          deleteFolderMutation.mutateAsync({
            id,
            force: true
          })
        )
      );

      toast.success(
        `Deleted ${folderIds.length} folder${folderIds.length > 1 ? 's' : ''} and files`
      );
      setSelectedFolders(new Set());
      setConfirmDeleteFoldersOpen(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete folder';
      toast.error(message);
    }
  };

  const handleCreateFolder = async (folderName: string) => {
    try {
      await createFolderMutation.mutateAsync({ name: folderName });
      toast.success(`Folder "${folderName}" created`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create folder';
      toast.error(message);
      throw err;
    }
  };

  const openFolder = (folder: MediaFolder) => {
    router.push(`/admin/media/folders/${encodeURIComponent(folder.id)}`);
  };

  const backToAllMedia = () => {
    router.push('/admin/media');
  };

  return (
    <div className='bg-background flex h-[calc(100dvh-52px)] min-h-0 flex-col'>
      {/* Top Toolbar */}
      <div className='border-border bg-card border-b px-6 py-4'>
        <div className='flex flex-wrap items-center gap-3'>
          {inFolderView ? (
            <Button type='button' variant='outline' onClick={backToAllMedia}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              All Media
            </Button>
          ) : null}

          {inFolderView ? (
            <div className='text-muted-foreground text-sm'>
              Folder:{' '}
              <span className='text-foreground font-medium'>
                {resolvedActiveFolder?.name ?? 'Selected Folder'}
              </span>
            </div>
          ) : null}

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

          {!inFolderView ? (
            <Button
              type='button'
              variant='outline'
              onClick={() => setCreateFolderModalOpen(true)}
            >
              <FolderPlus className='mr-2 h-4 w-4' />
              Create Folder
            </Button>
          ) : null}

          {selectedFolders.size > 0 && !inFolderView ? (
            <Button
              type='button'
              variant='destructive'
              size='sm'
              onClick={confirmDeleteSelectedFolders}
              disabled={deleteFolderMutation.isPending}
            >
              Delete Folder ({selectedFolders.size})
            </Button>
          ) : null}

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
        {isLoading ? (
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
        ) : filteredFiles.length === 0 && filteredFolders.length === 0 ? (
          <div className='flex h-full items-center justify-center'>
            <div className='text-center'>
              <FileImage className='text-muted-foreground mx-auto h-12 w-12' />
              <h3 className='mt-4 text-lg font-semibold'>
                {inFolderView
                  ? 'No files in this folder'
                  : 'No media files found'}
              </h3>
              <p className='text-muted-foreground mt-2 text-sm'>
                {searchQuery
                  ? 'Try adjusting your search'
                  : inFolderView
                    ? 'Upload files or go back to all media.'
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
            folders={filteredFolders}
            selectedFolders={selectedFolders}
            onToggleFolderSelection={toggleFolderSelection}
            onOpenFolder={openFolder}
            files={filteredFiles}
            selectedFiles={selectedFiles}
            onToggleSelection={toggleFileSelection}
            onPreview={setPreviewFile}
            onDelete={confirmDeleteSingle}
            deletingIds={deletingIds}
          />
        ) : (
          <MediaListView
            folders={filteredFolders}
            files={filteredFiles}
            selectedFolders={selectedFolders}
            selectedFiles={selectedFiles}
            onToggleFolderSelection={toggleFolderSelection}
            onToggleSelection={toggleFileSelection}
            onToggleAll={toggleAllSelection}
            onOpenFolder={openFolder}
            onPreview={setPreviewFile}
            onDelete={confirmDeleteSingle}
            deletingIds={deletingIds}
            page={page}
            pageSize={pageSize}
            pageCount={totalPages}
            onPageChange={setPage}
            onPageSizeChange={(nextSize) => {
              setPageSize(nextSize);
              setPage(1);
            }}
          />
        )}
      </div>

      {viewMode === 'grid' && (
        <div className='border-border bg-card border-t px-6 py-3'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <p className='text-muted-foreground text-sm'>
              Total {total} file{total === 1 ? '' : 's'}
            </p>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1}
              >
                Prev
              </Button>
              <span className='text-sm'>
                Page {page} of {totalPages}
              </span>
              <Button
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
              <span className='text-muted-foreground text-sm'>Rows</span>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className='w-[90px]'>
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
        </div>
      )}

      {/* Modals */}
      <UploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        folderId={activeFolderId}
      />
      <CreateFolderModal
        open={createFolderModalOpen}
        onOpenChange={setCreateFolderModalOpen}
        onCreate={handleCreateFolder}
      />
      <PreviewModal
        file={previewFile}
        open={!!previewFile}
        onOpenChange={(open) => !open && setPreviewFile(null)}
        onDelete={(file) => confirmDeleteSingle(file)}
      />
      <AlertModal
        isOpen={!!confirmState}
        onClose={() => setConfirmState(null)}
        onConfirm={executeDelete}
        loading={deleteLoading}
      />
      <AlertModal
        isOpen={confirmDeleteFoldersOpen}
        onClose={() => setConfirmDeleteFoldersOpen(false)}
        onConfirm={executeDeleteSelectedFolders}
        loading={deleteFolderMutation.isPending}
      />
    </div>
  );
}
