'use client';

import * as React from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { FileModal } from '@/components/modal/file-modal';
import type { MediaFile } from '@/features/media/types/media-type';

/**
 * React node-view for the imageGallery node. Renders the horizontal-scroll
 * strip and exposes per-image management UI:
 *   - hover × on each image to remove it
 *   - a "+ Add image" tile at the end of the strip to append more images
 *     (each gallery instance owns its own FileModal, so the modal context is
 *     local to the gallery being edited — no cross-talk between galleries).
 *
 * Removing the last image deletes the whole node so we never leave an empty
 * gallery container behind.
 */
export function ImageGalleryNodeView({
  node,
  updateAttributes,
  deleteNode,
  editor,
  selected
}: NodeViewProps) {
  const images: Array<{ src: string; alt?: string }> = Array.isArray(
    node.attrs.images
  )
    ? node.attrs.images
    : [];

  const isEditable = editor?.isEditable ?? true;
  const [addDialogOpen, setAddDialogOpen] = React.useState(false);

  const handleRemove = React.useCallback(
    (index: number) => {
      const next = images.filter((_, i) => i !== index);
      if (next.length === 0) {
        deleteNode();
        return;
      }
      updateAttributes({ images: next });
    },
    [images, updateAttributes, deleteNode]
  );

  const handleAppend = React.useCallback(
    (files: MediaFile[]) => {
      setAddDialogOpen(false);
      const additions = files
        .filter((file) => file.type === 'image' && Boolean(file.url))
        .map((file) => ({ src: file.url, alt: file.name }));
      if (additions.length === 0) return;
      updateAttributes({ images: [...images, ...additions] });
    },
    [images, updateAttributes]
  );

  return (
    <>
      <NodeViewWrapper
        className={`tiptap-image-gallery${
          selected ? 'tiptap-image-gallery--selected' : ''
        }`}
        data-type='image-gallery'
        // Inline styles are belt-and-braces — the global `img { max-width: 100% }`
        // rule and the editor's `prose` plugin can override the SCSS flex layout
        // depending on load order. Inline `style` wins over any external CSS
        // (except !important), so the strip stays horizontal no matter what.
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'nowrap',
          overflowX: 'auto',
          overflowY: 'hidden',
          gap: '0.5rem',
          padding: '0.5rem',
          margin: '1rem 0',
          scrollSnapType: 'x mandatory',
          scrollBehavior: 'smooth',
          border: '1px solid var(--tt-divider-color, #e5e7eb)',
          borderRadius: 'var(--tt-radius-xs, 0.25rem)',
          backgroundColor: 'var(--tt-bg-color, #fafafa)'
        }}
      >
        {images.map((image, index) => (
          <div
            key={`${index}-${image.src}`}
            className='tiptap-image-gallery__item-wrapper'
            style={{
              position: 'relative',
              flex: '0 0 auto',
              scrollSnapAlign: 'start'
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.src}
              alt={image.alt ?? ''}
              className='tiptap-image-gallery__item'
              loading='lazy'
              draggable={false}
              style={{
                display: 'block',
                width: '240px',
                height: '180px',
                maxWidth: '240px',
                objectFit: 'cover',
                borderRadius: 'var(--tt-radius-xs, 0.25rem)',
                margin: 0
              }}
            />
            {isEditable ? (
              <button
                type='button'
                className='tiptap-image-gallery__remove'
                onClick={() => handleRemove(index)}
                aria-label='Remove image from gallery'
                contentEditable={false}
              >
                ×
              </button>
            ) : null}
          </div>
        ))}

        {isEditable ? (
          <button
            type='button'
            className='tiptap-image-gallery__add'
            onClick={() => setAddDialogOpen(true)}
            aria-label='Add more images to gallery'
            contentEditable={false}
            style={{
              flex: '0 0 auto',
              width: '240px',
              height: '180px',
              scrollSnapAlign: 'start'
            }}
          >
            <span className='tiptap-image-gallery__add-icon' aria-hidden>
              +
            </span>
            <span className='tiptap-image-gallery__add-label'>Add image</span>
          </button>
        ) : null}
      </NodeViewWrapper>

      {isEditable ? (
        <FileModal
          isOpen={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          onSelect={(file) => handleAppend([file])}
          onSelectMultiple={handleAppend}
          title='Add images to gallery'
          description='Pick one or more images to append to this gallery.'
          types={['image']}
          accept='image/*'
          multiple
        />
      ) : null}
    </>
  );
}

export default ImageGalleryNodeView;
