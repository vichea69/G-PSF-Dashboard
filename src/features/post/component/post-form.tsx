'use client';

import { useMemo, useState } from 'react';
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
import { ArrowLeft, Save, Upload } from 'lucide-react';
import ProgressUpload from '@/components/file-upload/progress-upload';
import { useCategories } from '@/hooks/use-category';
import { usePage } from '@/hooks/use-page';

export type PostFormData = {
  title: string;
  status: 'published' | 'draft';
  content?: string;
  categoryId?: number | string;
  pageId?: number | string;
  image?: File;
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
  const [formData, setFormData] = useState<PostFormData>({
    title: editingPost?.title || '',
    status:
      editingPost?.status === 'published' || editingPost?.status === 'draft'
        ? editingPost.status
        : 'draft',
    content: editingPost?.content || '',
    categoryId: editingPost?.category?.id,
    pageId: editingPost?.page?.id,
    image: undefined
  });

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
              <CardDescription>Upload a cover image</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <Label>Cover Image</Label>
                <ProgressUpload
                  maxFiles={1}
                  multiple={false}
                  accept={'image/*'}
                  maxSize={5 * 1024 * 1024}
                  simulateUpload={false}
                  useDefaults={false}
                  onFilesChange={(files) => {
                    const first = files?.[0];
                    const f = first?.file;
                    // Defer state updates to avoid setting parent state during child render
                    setTimeout(() => {
                      setFormData((p) => ({
                        ...p,
                        image: f instanceof File ? f : undefined
                      }));
                    }, 0);
                  }}
                />
                {!formData.image ? (
                  <p className='text-muted-foreground flex items-center gap-1 text-xs'>
                    <Upload className='h-3 w-3' /> Optional, used as thumbnail
                  </p>
                ) : (
                  <p className='text-muted-foreground text-xs'>
                    Image selected: {formData.image.name}
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

              <Button onClick={handleSubmit}>
                <Save />
                {editingPost ? 'Update Post' : 'Create Post'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
