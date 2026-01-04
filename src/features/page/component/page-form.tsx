'use client';

import { useEffect, useState } from 'react';
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
import { ArrowLeft, Save, Eye, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export type PageFormData = {
  title: string;
  slug: string;
  status: 'published' | 'draft';
  content: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
  };
};

interface PageFormProps {
  editingPage?: any;
  onSave: (pageData: PageFormData) => void;
  onCancel: () => void;
}

export function PageForm({ editingPage, onSave, onCancel }: PageFormProps) {
  const [formData, setFormData] = useState<PageFormData>({
    title: editingPage?.title || '',
    slug: editingPage?.slug || '',
    status:
      editingPage?.status === 'published' || editingPage?.status === 'draft'
        ? editingPage.status
        : 'draft',
    content: editingPage?.content || '',
    seo: {
      metaTitle: editingPage?.metaTitle || editingPage?.seo?.metaTitle || '',
      metaDescription:
        editingPage?.metaDescription || editingPage?.seo?.metaDescription || ''
    }
  });

  useEffect(() => {
    if (!editingPage) return;
    setFormData((prev) => ({
      ...prev,
      title:
        typeof editingPage?.title === 'string' ? editingPage.title : prev.title,
      slug:
        typeof editingPage?.slug === 'string' ? editingPage.slug : prev.slug,
      status:
        editingPage?.status === 'published' || editingPage?.status === 'draft'
          ? editingPage.status
          : prev.status,
      content: editingPage?.content ?? prev.content,
      seo: {
        metaTitle:
          editingPage?.metaTitle ||
          editingPage?.seo?.metaTitle ||
          prev.seo.metaTitle,
        metaDescription:
          editingPage?.metaDescription ||
          editingPage?.seo?.metaDescription ||
          prev.seo.metaDescription
      }
    }));
  }, [editingPage]);

  const handleTitleChange = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    setFormData((prev) => ({
      ...prev,
      title,
      slug,
      seo: {
        ...prev.seo,
        metaTitle: prev.seo.metaTitle || title
      }
    }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className='space-y-6'>
      {/* Form Content */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Main Content */}
        <div className='space-y-6 lg:col-span-2'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                Page Content
                <Badge variant='secondary' className='text-xs'>
                  Required
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Label htmlFor='title' className='flex items-center gap-2'>
                  Page Title
                  <HelpCircle className='text-muted-foreground h-3 w-3' />
                </Label>
                <Input
                  id='title'
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder='Enter a clear, descriptive title'
                  className='mt-1'
                />
              </div>

              <div>
                <Label htmlFor='slug' className='flex items-center gap-2'>
                  URL Slug
                  <HelpCircle className='text-muted-foreground h-3 w-3' />
                </Label>
                <div className='mt-1 flex items-center'>
                  <span className='text-muted-foreground bg-muted rounded-l-md border border-r-0 px-3 py-2 text-sm'>
                    yoursite.com/
                  </span>
                  <Input
                    id='slug'
                    value={formData.slug}
                    readOnly
                    placeholder='auto-generated from title'
                    className='rounded-l-none'
                  />
                </div>
              </div>

              {/* Removed excerpt - not required by API */}

              <div>
                <Label htmlFor='content'>Page Content</Label>
                <Textarea
                  id='content'
                  value={formData.content}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      content: e.target.value
                    }))
                  }
                  placeholder='Write your page content here...'
                  rows={12}
                  className='mt-1 font-mono text-sm'
                />
                {/* Content formatting note removed */}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Settings */}
        <div className='space-y-6'>
          {/* Publish Settings */}
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
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger className='mt-1'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='draft'>
                      <div className='flex items-center gap-2'>
                        <div className='h-2 w-2 rounded-full bg-amber-500'></div>
                        Draft
                      </div>
                    </SelectItem>
                    <SelectItem value='published'>
                      <div className='flex items-center gap-2'>
                        <div className='h-2 w-2 rounded-full bg-green-500'></div>
                        Published
                      </div>
                    </SelectItem>
                    {/* Archived option removed to match API */}
                  </SelectContent>
                </Select>
              </div>

              {/* Removed contentType - not required by API */}
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card>
            <CardHeader>
              <CardTitle className='text-sm'>SEO Settings</CardTitle>
              <CardDescription className='text-xs'>
                Help search engines understand your page
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Label htmlFor='metaTitle'>Meta Title</Label>
                <Input
                  id='metaTitle'
                  value={formData.seo.metaTitle}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      seo: { ...prev.seo, metaTitle: e.target.value }
                    }))
                  }
                  placeholder='SEO title for search engines'
                  className='mt-1'
                />
                <p className='text-muted-foreground mt-1 text-xs'>
                  {formData.seo.metaTitle.length}/60 characters
                </p>
              </div>

              <div>
                <Label htmlFor='metaDescription'>Meta Description</Label>
                <Textarea
                  id='metaDescription'
                  value={formData.seo.metaDescription}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      seo: { ...prev.seo, metaDescription: e.target.value }
                    }))
                  }
                  placeholder='Brief description for search results...'
                  rows={3}
                  className='mt-1'
                />
                <p className='text-muted-foreground mt-1 text-xs'>
                  {formData.seo.metaDescription.length}/160 characters
                </p>
              </div>

              {/* Removed canonicalUrl/ogImageUrl - not required by API */}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className='pt-6'>
              <div className='space-y-3'>
                <Button onClick={handleSubmit} className='w-full'>
                  <Save />
                  {editingPage ? 'Update Page' : 'Create Page'}
                </Button>

                {editingPage && (
                  <Button variant='outline' className='w-full bg-transparent'>
                    <Eye className='mr-2 h-4 w-4' />
                    Preview Changes
                  </Button>
                )}

                <Button variant='outline' onClick={onCancel} className='w-full'>
                  <ArrowLeft />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
