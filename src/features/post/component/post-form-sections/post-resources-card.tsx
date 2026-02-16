'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { FileText, ImageIcon } from 'lucide-react';
import { FileModal } from '@/components/modal/file-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { MediaFile } from '@/features/media/types/media-type';
import { resolveApiAssetUrl } from '@/lib/asset-url';

type PostResourcesCardProps = {
  coverImage: string;
  document: string;
  documentThumbnail: string;
  link: string;
  onCoverImageChange: (value: string) => void;
  onDocumentChange: (value: string) => void;
  onDocumentThumbnailChange: (value: string) => void;
  onLinkChange: (value: string) => void;
};

type PickerTarget = 'coverImage' | 'document' | null;

const getFileNameFromUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const withoutParams = trimmed.split('?')[0].split('#')[0];
  const fileName = withoutParams.split('/').filter(Boolean).at(-1) ?? '';
  if (!fileName) return trimmed;
  try {
    return decodeURIComponent(fileName);
  } catch {
    return fileName;
  }
};

export function PostResourcesCard({
  coverImage,
  document,
  documentThumbnail,
  link,
  onCoverImageChange,
  onDocumentChange,
  onDocumentThumbnailChange,
  onLinkChange
}: PostResourcesCardProps) {
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);

  const coverPreviewUrl = useMemo(
    () => resolveApiAssetUrl(coverImage),
    [coverImage]
  );
  const documentPreviewUrl = useMemo(
    () => resolveApiAssetUrl(document),
    [document]
  );
  const documentThumbnailUrl = useMemo(
    () => resolveApiAssetUrl(documentThumbnail),
    [documentThumbnail]
  );
  const coverImageName = useMemo(
    () => getFileNameFromUrl(coverImage),
    [coverImage]
  );
  const documentName = useMemo(() => getFileNameFromUrl(document), [document]);

  const handleSelectFromMedia = (file: MediaFile) => {
    const selectedUrl = (file.url ?? '').trim();
    if (!selectedUrl) return;

    if (pickerTarget === 'coverImage') {
      onCoverImageChange(selectedUrl);
      return;
    }

    if (pickerTarget === 'document') {
      onDocumentThumbnailChange((file.thumbnail ?? '').trim());
      onDocumentChange(selectedUrl);
    }
  };

  return (
    <Card>
      {/* <CardHeader>
        <CardTitle className='text-sm'>Additional Resources</CardTitle>
        <CardDescription>
          Select cover image and document from Media Manager
        </CardDescription>
      </CardHeader> */}
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <div className='flex items-center justify-between gap-2'>
            <Label>Cover Image</Label>
            <div className='flex items-center gap-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setPickerTarget('coverImage')}
              >
                Choose file
              </Button>
              {coverImage ? (
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() => onCoverImageChange('')}
                >
                  Clear
                </Button>
              ) : null}
            </div>
          </div>
          {coverPreviewUrl ? (
            <div className='overflow-hidden rounded-md border'>
              <div className='bg-muted flex items-center gap-2 border-b px-3 py-2 text-xs font-medium'>
                <ImageIcon className='h-3.5 w-3.5' />
                {coverImageName || 'Cover image selected'}
              </div>
              <div className='relative h-40 w-50'>
                <Image
                  src={coverPreviewUrl}
                  alt='Cover image preview'
                  fill
                  unoptimized
                  className='object-cover'
                />
              </div>
            </div>
          ) : (
            <div className='text-muted-foreground rounded-md border border-dashed p-3 text-sm'>
              No cover image selected
            </div>
          )}
        </div>

        <div className='space-y-2'>
          <div className='flex items-center justify-between gap-2'>
            <Label>Document file</Label>
            <div className='flex items-center gap-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setPickerTarget('document')}
              >
                Choose file
              </Button>
              {document ? (
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() => {
                    onDocumentThumbnailChange('');
                    onDocumentChange('');
                  }}
                >
                  Clear
                </Button>
              ) : null}
            </div>
          </div>
          {documentPreviewUrl ? (
            <div className='space-y-2 rounded-md border p-3'>
              <p className='flex items-center gap-2 text-sm font-medium'>
                <FileText className='h-4 w-4' />
                {documentName || 'Selected document'}
              </p>
              {documentThumbnailUrl ? (
                <div className='relative h-40 w-50 overflow-hidden'>
                  <Image
                    src={documentThumbnailUrl}
                    alt='Document thumbnail'
                    fill
                    unoptimized
                    className='object-contain'
                  />
                </div>
              ) : (
                <div className='text-muted-foreground bg-muted/40 rounded border p-3 text-sm'>
                  Preview not available
                </div>
              )}
              <Button asChild variant='outline' size='sm' className='w-fit'>
                <a href={documentPreviewUrl} target='_blank' rel='noreferrer'>
                  Open document
                </a>
              </Button>
            </div>
          ) : (
            <div className='text-muted-foreground rounded-md border border-dashed p-3 text-sm'>
              No document selected (optional)
            </div>
          )}
        </div>

        <div>
          <Label htmlFor='external-link'>Link</Label>
          <Input
            id='external-link'
            value={link}
            onChange={(event) => onLinkChange(event.target.value)}
            placeholder='https://example.com (optional)'
            className='mt-1'
          />
        </div>
      </CardContent>

      <FileModal
        isOpen={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        onSelect={handleSelectFromMedia}
        title={
          pickerTarget === 'coverImage'
            ? 'Select cover image'
            : 'Select document'
        }
        description='Choose a file from Media Manager.'
        types={pickerTarget === 'coverImage' ? ['image'] : ['pdf', 'document']}
        accept={pickerTarget === 'coverImage' ? 'image/*' : '*/*'}
        allowUploadFromDevice={false}
      />
    </Card>
  );
}
