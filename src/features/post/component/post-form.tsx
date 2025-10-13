'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Save, Upload } from 'lucide-react';
import ProgressUpload from '@/components/file-upload/progress-upload';
import type { FileWithPreview } from '@/hooks/use-file-upload';
import { useCategories } from '@/hooks/use-category';
import { usePage } from '@/hooks/use-page';

export type PostFormData = {
  title: string;
  status: 'published' | 'draft';
  content?: string;
  categoryId?: number | string;
  pageId?: number | string;
  newImages: File[];
  existingImageIds: number[];
  removedImageIds: number[];
};

type PostFormProps = {
  editingPost?: any | null;
  onSave: (data: PostFormData) => void | Promise<void>;
  onCancel: () => void;
};

export default function PostForm({
  editingPost,
  onSave,
  onCancel
}: PostFormProps) {
  type EditingImage = {
    key: string;
    id?: number;
    url: string;
    sortOrder: number;
    fileName: string;
    size: number;
    mimeType: string;
  };

  const editingImages: EditingImage[] = useMemo(() => {
    if (!Array.isArray(editingPost?.images)) return [];
    return editingPost.images
      .filter((img: any) => img && typeof img === 'object')
      .map((img: any, index: number) => {
        const id = typeof img.id === 'number' ? img.id : undefined;
        const key = id !== undefined ? String(id) : `existing-${index}`;
        const url = typeof img.url === 'string' ? img.url : '';
        return {
          key,
          id,
          url,
          sortOrder: typeof img.sortOrder === 'number' ? img.sortOrder : index,
          fileName:
            typeof img.fileName === 'string' && img.fileName.length > 0
              ? img.fileName
              : `Image ${index + 1}`,
          size: typeof img.size === 'number' ? img.size : 0,
          mimeType:
            typeof img.mimeType === 'string' && img.mimeType.length > 0
              ? img.mimeType
              : 'image/*'
        } as EditingImage;
      })
      .sort(
        (a: { sortOrder: number }, b: { sortOrder: number }) =>
          a.sortOrder - b.sortOrder
      );
  }, [editingPost]);

  const existingImageIdMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const img of editingImages) {
      if (typeof img.id === 'number') {
        map.set(img.key, img.id);
      }
    }
    return map;
  }, [editingImages]);

  const initialFileMetadata = useMemo(() => {
    return editingImages.map((img) => ({
      id: img.key,
      name: img.fileName,
      size: img.size,
      type: img.mimeType,
      url: img.url
    }));
  }, [editingImages]);

  const [formData, setFormData] = useState<PostFormData>({
    title: editingPost?.title || '',
    status:
      editingPost?.status === 'published' || editingPost?.status === 'draft'
        ? editingPost.status
        : 'draft',
    content: editingPost?.content || '',
    categoryId: editingPost?.category?.id,
    pageId: editingPost?.page?.id,
    newImages: [],
    existingImageIds: editingImages
      .map((img) => img.id)
      .filter((id): id is number => typeof id === 'number'),
    removedImageIds: []
  });

  const [uploadedFiles, setUploadedFiles] = useState<FileWithPreview[]>(() =>
    initialFileMetadata.map((file) => ({
      id: file.id,
      file,
      preview: file.url
    }))
  );

  useEffect(() => {
    setUploadedFiles(
      initialFileMetadata.map((file) => ({
        id: file.id,
        file,
        preview: file.url
      }))
    );
    setFormData((prev) => ({
      ...prev,
      existingImageIds: editingImages
        .map((img) => img.id)
        .filter((id): id is number => typeof id === 'number'),
      removedImageIds: []
    }));
  }, [editingImages, initialFileMetadata]);

  const { data: categoriesData } = useCategories();
  const categories = useMemo(() => {
    const raw = (categoriesData?.data ?? categoriesData) as any;
    return Array.isArray(raw) ? raw : [];
  }, [categoriesData]);

  const { data: pagesData } = usePage();
  const pages = useMemo(() => {
    const raw = (pagesData?.data ?? pagesData) as any;
    return Array.isArray(raw) ? raw : [];
  }, [pagesData]);

  // Slug removed per request; backend will derive if needed.

  const handleSubmit = () => {
    onSave(formData);
  };

  const previewImages = useMemo(() => {
    return uploadedFiles
      .filter((file) => typeof file.preview === 'string' && file.preview)
      .map((file) => ({
        id: file.id,
        src: file.preview as string,
        isNew: file.file instanceof File
      }));
  }, [uploadedFiles]);

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='space-y-6 lg:col-span-2'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                Post Content
                <Badge variant='secondary' className='text-xs'>
                  Required
                </Badge>
              </CardTitle>
              <CardDescription>Write your post details</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Label htmlFor='title'>Title</Label>
                <Input
                  id='title'
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder='Enter a clear, descriptive title'
                  className='mt-1'
                />
              </div>
              <div>
                <Label htmlFor='content'>Content</Label>
                <Textarea
                  id='content'
                  value={formData.content}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, content: e.target.value }))
                  }
                  rows={8}
                  placeholder='Write the post content...'
                  className='mt-1'
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-sm'>Media</CardTitle>
              <CardDescription>Upload and manage post images</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {previewImages.length > 0 ? (
                <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
                  {previewImages.map((image) => (
                    <div
                      key={image.id}
                      className='relative h-24 w-full overflow-hidden rounded-md border'
                    >
                      <img
                        src={image.src}
                        alt='Uploaded preview'
                        className='h-full w-full object-cover'
                      />
                      {image.isNew ? (
                        <span className='text-background absolute right-1 bottom-1 rounded bg-emerald-500/90 px-1 text-[10px] font-semibold uppercase'>
                          New
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}
              <div className='space-y-2'>
                <Label>Images</Label>
                <ProgressUpload
                  maxFiles={10}
                  multiple
                  accept={'image/*'}
                  maxSize={5 * 1024 * 1024}
                  simulateUpload={false}
                  useDefaults={false}
                  initialFiles={initialFileMetadata}
                  onFilesChange={(files) => {
                    setUploadedFiles(files);
                    setTimeout(() => {
                      const newImages = files
                        .filter((file) => file.file instanceof File)
                        .map((file) => file.file as File);
                      const keptExistingIds = files
                        .map((file) => existingImageIdMap.get(file.id))
                        .filter((id): id is number => typeof id === 'number');
                      const removedImageIds = Array.from(
                        existingImageIdMap.values()
                      ).filter((id) => !keptExistingIds.includes(id));

                      setFormData((prev) => ({
                        ...prev,
                        newImages,
                        existingImageIds: keptExistingIds,
                        removedImageIds
                      }));
                    }, 0);
                  }}
                />
                {previewImages.length === 0 ? (
                  <p className='text-muted-foreground flex items-center gap-1 text-xs'>
                    <Upload className='h-3 w-3' /> Optional, will appear in the
                    gallery and thumbnail
                  </p>
                ) : (
                  <p className='text-muted-foreground text-xs'>
                    Remove existing images or add more as needed
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='text-sm'>Publish Settings</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Label htmlFor='status'>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: value as 'draft' | 'published'
                    }))
                  }
                >
                  <SelectTrigger className='mt-1'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='draft'>Draft</SelectItem>
                    <SelectItem value='published'>Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor='category'>Category</Label>
                <Select
                  value={(formData.categoryId ?? '').toString()}
                  onValueChange={(value) =>
                    setFormData((p) => ({ ...p, categoryId: value }))
                  }
                >
                  <SelectTrigger className='mt-1'>
                    <SelectValue placeholder='Select a category' />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c: any) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name ?? c.title ?? c.slug ?? c.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor='page'>Page</Label>
                <Select
                  value={(formData.pageId ?? '').toString()}
                  onValueChange={(value) =>
                    setFormData((p) => ({ ...p, pageId: value }))
                  }
                >
                  <SelectTrigger className='mt-1'>
                    <SelectValue placeholder='Attach to a page (optional)' />
                  </SelectTrigger>
                  <SelectContent>
                    {pages.map((p: any) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.title ?? p.slug ?? p.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='flex items-center gap-2'>
                <Button variant='outline' onClick={onCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  <Save className='mr-2 h-4 w-4' />
                  {editingPost ? 'Update Post' : 'Create Post'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
