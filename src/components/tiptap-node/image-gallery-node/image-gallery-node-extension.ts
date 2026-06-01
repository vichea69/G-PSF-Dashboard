import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ImageGalleryNodeView } from './image-gallery-node-view';

export interface GalleryImage {
  src: string;
  alt?: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageGallery: {
      /**
       * Insert an image gallery block at the current selection.
       * Pass an array of image objects ({ src, alt? }).
       */
      insertImageGallery: (images: GalleryImage[]) => ReturnType;
    };
  }
}

/**
 * `imageGallery` is a block-level Tiptap node that holds multiple images and
 * renders them as a horizontally scrollable strip. Each gallery is one node in
 * the document, so the cursor can't accidentally land between images — fixing
 * the awkward edit-and-cursor-jump problem you get if you try to group images
 * with plain CSS.
 *
 * Storage shape (what we save to the DB):
 *   { type: 'imageGallery', attrs: { images: [{ src, alt }, ...] } }
 */
export const ImageGallery = Node.create({
  name: 'imageGallery',
  group: 'block',
  atom: true, // the node has no editable children; treat as one unit
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      images: {
        default: [] as GalleryImage[],
        // Serialize the array as a JSON string in the data-images attribute so
        // it survives HTML round-trips when the doc is serialized to HTML.
        parseHTML: (element) => {
          const raw = element.getAttribute('data-images');
          if (!raw) return [];
          try {
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return [];
            return parsed
              .map((item) => {
                if (!item || typeof item !== 'object') return null;
                const src =
                  typeof (item as { src?: unknown }).src === 'string'
                    ? (item as { src: string }).src.trim()
                    : '';
                if (!src) return null;
                const alt =
                  typeof (item as { alt?: unknown }).alt === 'string'
                    ? (item as { alt: string }).alt
                    : undefined;
                return alt ? { src, alt } : { src };
              })
              .filter((item): item is GalleryImage => item !== null);
          } catch {
            return [];
          }
        },
        renderHTML: (attributes) => {
          const images = Array.isArray(attributes.images)
            ? attributes.images
            : [];
          return {
            'data-images': JSON.stringify(images)
          };
        }
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="image-gallery"]'
      }
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const images: GalleryImage[] = Array.isArray(node.attrs.images)
      ? node.attrs.images
      : [];

    // Render as a horizontally scrollable strip. Each child image gets
    // scroll-snap so flicking lands on a clean image edge.
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'image-gallery',
        class: 'tiptap-image-gallery'
      }),
      ...images.map((image) => [
        'img',
        {
          src: image.src,
          alt: image.alt ?? '',
          class: 'tiptap-image-gallery__item',
          loading: 'lazy'
        }
      ])
    ];
  },

  addCommands() {
    return {
      insertImageGallery:
        (images) =>
        ({ chain }) => {
          const cleaned = Array.isArray(images)
            ? images
                .map((img) => {
                  const src =
                    typeof img?.src === 'string' ? img.src.trim() : '';
                  if (!src) return null;
                  return img.alt ? { src, alt: img.alt } : { src };
                })
                .filter((img): img is GalleryImage => img !== null)
            : [];
          if (cleaned.length === 0) return false;

          return chain()
            .focus()
            .insertContent({
              type: this.name,
              attrs: { images: cleaned }
            })
            .run();
        }
    };
  },

  // React node-view gives each image its own × button so the author can remove
  // individual images instead of being forced to delete the whole gallery.
  addNodeView() {
    return ReactNodeViewRenderer(ImageGalleryNodeView);
  }
});

export default ImageGallery;
