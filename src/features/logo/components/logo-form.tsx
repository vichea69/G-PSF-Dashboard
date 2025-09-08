'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
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
import { Badge } from '@/components/ui/badge';
import { Save, Upload } from 'lucide-react';
import ProgressUpload from '@/components/file-upload/progress-upload';

export type LogoFormData = {
  title: string;
  logo?: File;
};

type LogoFormProps = {
  editingLogo?: any | null;
  onSave: (data: LogoFormData) => void | Promise<void>;
  onCancel: () => void;
};

export default function LogoForm({
  editingLogo,
  onSave,
  onCancel
}: LogoFormProps) {
  const [formData, setFormData] = useState<LogoFormData>({
    title: editingLogo?.title || '',
    logo: undefined
  });

  const objectUrlRef = useRef<string | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string>(() => {
    const candidate =
      (typeof editingLogo?.url === 'string' && editingLogo.url) ||
      (typeof editingLogo?.logo === 'string' && editingLogo.logo) ||
      (typeof editingLogo?.imageUrl === 'string' && editingLogo.imageUrl) ||
      '';
    return candidate || '';
  });

  const existingFileName = useMemo(() => {
    const explicit = (
      editingLogo?.fileName ||
      editingLogo?.filename ||
      ''
    ).toString();
    if (explicit) return explicit;
    const url: string =
      (typeof editingLogo?.url === 'string' && editingLogo.url) ||
      (typeof editingLogo?.logo === 'string' && editingLogo.logo) ||
      (typeof editingLogo?.imageUrl === 'string' && editingLogo.imageUrl) ||
      '';
    if (!url) return '';
    try {
      const withoutQuery = url.split('?')[0];
      const last = withoutQuery.split('/').pop() || '';
      return decodeURIComponent(last);
    } catch {
      return '';
    }
  }, [editingLogo]);

  const handleSubmit = () => {
    onSave(formData);
  };

  useEffect(() => {
    return () => {
      if (objectUrlRef.current && objectUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  // When editingLogo arrives/changes, hydrate the form and preview
  useEffect(() => {
    if (!editingLogo) return;
    setFormData((prev) => ({
      ...prev,
      title: editingLogo?.title ?? prev.title
    }));
    const candidate =
      (typeof editingLogo?.url === 'string' && editingLogo.url) ||
      (typeof editingLogo?.logo === 'string' && editingLogo.logo) ||
      (typeof editingLogo?.imageUrl === 'string' && editingLogo.imageUrl) ||
      '';
    if (candidate) setPreviewSrc(candidate);
  }, [editingLogo]);

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='space-y-6 lg:col-span-2'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                Logo Details
                <Badge variant='secondary' className='text-xs'>
                  Required
                </Badge>
              </CardTitle>
              <CardDescription>Set your company name and logo</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Label htmlFor='title'>Company Name</Label>
                <Input
                  id='title'
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder='Enter company or brand name'
                  className='mt-1'
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-sm'>Logo</CardTitle>
              <CardDescription>Upload a logo image</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {previewSrc ? (
                <div className='relative h-24 w-24 overflow-hidden rounded-md border'>
                  <Image
                    src={previewSrc}
                    alt='Logo preview'
                    fill
                    sizes='96px'
                    className='object-contain'
                    unoptimized
                  />
                </div>
              ) : null}
              <div className='space-y-2'>
                <Label>Logo Image</Label>
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
                    setTimeout(() => {
                      setFormData((p) => ({
                        ...p,
                        logo: f instanceof File ? f : undefined
                      }));
                      if (f instanceof File) {
                        if (
                          objectUrlRef.current &&
                          objectUrlRef.current.startsWith('blob:')
                        ) {
                          URL.revokeObjectURL(objectUrlRef.current);
                        }
                        const url = URL.createObjectURL(f);
                        objectUrlRef.current = url;
                        setPreviewSrc(url);
                      }
                    }, 0);
                  }}
                />
                {!previewSrc ? (
                  <p className='text-muted-foreground flex items-center gap-1 text-xs'>
                    <Upload className='h-3 w-3' /> Optional, PNG/SVG preferred
                  </p>
                ) : formData.logo ? (
                  <p className='text-muted-foreground text-xs'>
                    New image selected: {formData.logo.name}
                  </p>
                ) : (
                  <p className='text-muted-foreground text-xs'>
                    Existing image
                    {existingFileName ? `: ${existingFileName}` : ''}
                  </p>
                )}
                {editingLogo && (formData.title || editingLogo?.title) ? (
                  <p className='text-muted-foreground text-[11px]'>
                    For: {formData.title || editingLogo?.title}
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='text-sm'>Actions</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center gap-2'>
                <Button variant='outline' onClick={onCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  <Save className='mr-2 h-4 w-4' />
                  {editingLogo ? 'Update Logo' : 'Create Logo'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
