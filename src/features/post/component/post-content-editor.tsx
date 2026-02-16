'use client';

import * as React from 'react';
import { EditorContent, EditorContext, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { mergeAttributes } from '@tiptap/core';
import type { JSONContent } from '@tiptap/core';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { TextAlign } from '@tiptap/extension-text-align';
import { Typography } from '@tiptap/extension-typography';
import { Highlight } from '@tiptap/extension-highlight';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Selection } from '@tiptap/extensions';
import { FileModal } from '@/components/modal/file-modal';

import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator
} from '@/components/tiptap-ui-primitive/toolbar';
import { Button } from '@/components/tiptap-ui-primitive/button';
import { HeadingDropdownMenu } from '@/components/tiptap-ui/heading-dropdown-menu';
import { ListDropdownMenu } from '@/components/tiptap-ui/list-dropdown-menu';
import { BlockquoteButton } from '@/components/tiptap-ui/blockquote-button';
import { CodeBlockButton } from '@/components/tiptap-ui/code-block-button';
import { MarkButton } from '@/components/tiptap-ui/mark-button';
import { ColorHighlightPopover } from '@/components/tiptap-ui/color-highlight-popover';
import { LinkPopover } from '@/components/tiptap-ui/link-popover';
import { TextAlignButton } from '@/components/tiptap-ui/text-align-button';

import { HorizontalRule } from '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension';
import { ImageUploadNode } from '@/components/tiptap-node/image-upload-node/image-upload-node-extension';
import '@/components/tiptap-node/blockquote-node/blockquote-node.scss';
import '@/components/tiptap-node/code-block-node/code-block-node.scss';
import '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss';
import '@/components/tiptap-node/list-node/list-node.scss';
import '@/components/tiptap-node/image-node/image-node.scss';
import '@/components/tiptap-node/heading-node/heading-node.scss';
import '@/components/tiptap-node/paragraph-node/paragraph-node.scss';

import {
  handleImageUpload,
  isNodeTypeSelected,
  MAX_FILE_SIZE
} from '@/lib/tiptap-utils';
import { cn } from '@/lib/utils';
import type { PostContent } from '@/server/action/post/types';
import type { MediaFile } from '@/features/media/types/media-type';

type EditorContentValue = PostContent | string;

const EMPTY_CONTENT: PostContent = {
  type: 'doc',
  content: [{ type: 'paragraph' }]
};

const normalizeContent = (value?: EditorContentValue): EditorContentValue => {
  if (!value) return EMPTY_CONTENT;
  if (typeof value === 'string') {
    return value.trim().length ? value : EMPTY_CONTENT;
  }
  return value;
};

const isSameContent = (
  next: EditorContentValue,
  current: EditorContentValue
) => {
  if (typeof next === 'string' && typeof current === 'string') {
    return next === current;
  }
  if (typeof next === 'string' || typeof current === 'string') {
    return false;
  }
  return JSON.stringify(next) === JSON.stringify(current);
};

const serializeMediaAttribute = (media: unknown): string | undefined => {
  if (!media) return undefined;
  if (typeof media === 'string') return media;
  try {
    return JSON.stringify(media);
  } catch {
    return undefined;
  }
};

function readThumbnailFromMetadata(metadata: unknown): string | undefined {
  if (!metadata || typeof metadata !== 'object') return undefined;

  const record = metadata as Record<string, unknown>;
  const candidate =
    record.thumbnail ?? record.thumb ?? record.previewUrl ?? record.preview;

  return typeof candidate === 'string' && candidate.trim().length > 0
    ? candidate
    : undefined;
}

type PostContentEditorProps = {
  id?: string;
  value?: EditorContentValue;
  onChange?: (value: PostContent) => void;
  placeholder?: string;
  className?: string;
};

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: 'center',
        parseHTML: (element) =>
          element.getAttribute('data-align') ?? element.style?.textAlign ?? null
      },
      width: {
        default: null,
        parseHTML: (element) =>
          element.getAttribute('data-width') ?? element.style?.width ?? null
      },
      media: {
        default: null,
        parseHTML: (element) => {
          const raw = element.getAttribute('data-media');
          if (!raw) return null;
          try {
            return JSON.parse(raw);
          } catch {
            return raw;
          }
        }
      }
    };
  },
  renderHTML({ HTMLAttributes }) {
    const { align, width, style, media, ...rest } = HTMLAttributes as Record<
      string,
      unknown
    >;
    const styles: string[] = [];
    if (typeof style === 'string' && style.trim()) {
      styles.push(style.trim());
    }
    if (typeof width === 'string' && width.trim()) {
      styles.push(`width: ${width.trim()};`);
    }
    if (typeof align === 'string' && align.trim()) {
      if (align === 'left') {
        styles.push('display: block; margin-left: 0; margin-right: auto;');
      } else if (align === 'right') {
        styles.push('display: block; margin-left: auto; margin-right: 0;');
      } else {
        styles.push('display: block; margin-left: auto; margin-right: auto;');
      }
    }

    const serializedMedia = serializeMediaAttribute(media);

    return [
      'img',
      mergeAttributes(this.options.HTMLAttributes, {
        ...rest,
        style: styles.join(' '),
        'data-align': typeof align === 'string' ? align : undefined,
        'data-width': typeof width === 'string' ? width : undefined,
        'data-media': serializedMedia
      })
    ];
  }
});

export function PostContentEditor({
  id,
  value,
  onChange,
  placeholder,
  className
}: PostContentEditorProps) {
  const lastSyncedContent = React.useRef<EditorContentValue>(
    normalizeContent(value)
  );

  const [isImageSelected, setIsImageSelected] = React.useState(false);
  const [imageDialogOpen, setImageDialogOpen] = React.useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    content: lastSyncedContent.current,
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        'aria-label': 'Post content editor',
        class: cn(
          'tiptap post-content-editor__body prose prose-slate max-w-none dark:prose-invert',
          'focus:outline-none min-h-[280px] text-sm leading-6'
        ),
        'data-placeholder': placeholder ?? 'Write the post content...'
      }
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true
        }
      }),
      HorizontalRule,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      ResizableImage,
      Typography,
      Superscript,
      Subscript,
      Selection,
      ImageUploadNode.configure({
        accept: 'image/*',
        maxSize: MAX_FILE_SIZE,
        limit: 5,
        upload: handleImageUpload,
        onError: (error) => console.error('Upload failed:', error)
      })
    ],
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      lastSyncedContent.current = json;
      onChange?.(json);
    }
  });

  React.useEffect(() => {
    if (!editor) return;
    const updateSelectionState = () => {
      setIsImageSelected(isNodeTypeSelected(editor, ['image']));
    };
    updateSelectionState();
    editor.on('selectionUpdate', updateSelectionState);
    editor.on('transaction', updateSelectionState);
    return () => {
      editor.off('selectionUpdate', updateSelectionState);
      editor.off('transaction', updateSelectionState);
    };
  }, [editor]);

  const imageAttrs = editor?.getAttributes('image') ?? {};
  const imageAlign =
    typeof imageAttrs.align === 'string' ? imageAttrs.align : '';
  const imageWidth =
    typeof imageAttrs.width === 'string' ? imageAttrs.width : '';

  const setImageAlign = React.useCallback(
    (align: 'left' | 'center' | 'right') => {
      if (!editor) return;
      editor.chain().focus().updateAttributes('image', { align }).run();
    },
    [editor]
  );

  const setImageWidth = React.useCallback(
    (width: string | null) => {
      if (!editor) return;
      editor
        .chain()
        .focus()
        .updateAttributes('image', { width: width ?? null })
        .run();
    },
    [editor]
  );

  const handleUploadFromDevice = React.useCallback(
    async (files: File[]) => {
      if (!editor || files.length === 0) return;
      setImageDialogOpen(false);

      const uploads: Array<{
        file: File;
        url: string;
        metadata?: unknown;
      }> = [];
      for (const file of files) {
        try {
          const result = await handleImageUpload(file);
          uploads.push({ file, url: result.url, metadata: result.metadata });
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Upload failed:', error);
        }
      }

      if (uploads.length === 0) return;

      const contentNodes = uploads.flatMap<JSONContent>(
        ({ file, url, metadata }) => {
          const filename = file?.name || 'file';
          const isImage = Boolean(file?.type?.startsWith('image/'));
          const isPdf = file?.type === 'application/pdf';
          const pdfThumbnail = isPdf
            ? readThumbnailFromMetadata(metadata)
            : undefined;

          if (isImage) {
            const media = {
              name: file?.name,
              size: file?.size,
              type: file?.type,
              url,
              ...(metadata && typeof metadata === 'object' ? metadata : {}),
              source:
                metadata && typeof metadata === 'object' && 'source' in metadata
                  ? (metadata as { source?: string }).source
                  : 'upload'
            };

            const imageTitle = file?.name.replace(/\.[^/.]+$/, '') || 'image';

            return [
              {
                type: 'image',
                attrs: {
                  src: url,
                  alt: imageTitle,
                  title: imageTitle,
                  media
                }
              }
            ];
          }

          // For PDF, show thumbnail preview (if backend returns one), then keep a link.
          if (isPdf && pdfThumbnail) {
            const media = {
              name: file?.name,
              size: file?.size,
              type: file?.type,
              url,
              thumbnail: pdfThumbnail,
              ...(metadata && typeof metadata === 'object' ? metadata : {}),
              source:
                metadata && typeof metadata === 'object' && 'source' in metadata
                  ? (metadata as { source?: string }).source
                  : 'upload'
            };

            return [
              {
                type: 'image',
                attrs: {
                  src: pdfThumbnail,
                  alt: filename,
                  title: filename,
                  media
                }
              },
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: filename,
                    marks: [
                      {
                        type: 'link',
                        attrs: {
                          href: url
                        }
                      }
                    ]
                  }
                ]
              }
            ];
          }

          // Fallback for video/document without thumbnail: insert as link.
          return [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: filename,
                  marks: [
                    {
                      type: 'link',
                      attrs: {
                        href: url
                      }
                    }
                  ]
                }
              ]
            }
          ];
        }
      );

      editor.chain().focus().insertContent(contentNodes).run();
    },
    [editor]
  );

  const handleInsertFromMedia = React.useCallback(
    (file: MediaFile | null) => {
      if (!editor || !file) return;
      setImageDialogOpen(false);
      const uploadedAt = file.uploadedAt
        ? file.uploadedAt.toISOString()
        : undefined;
      const metadata = {
        id: file.id,
        name: file.name,
        type: file.type,
        size: file.size,
        url: file.url,
        thumbnail: file.thumbnail,
        uploadedAt,
        source: 'media'
      };

      if (file.type === 'image') {
        editor
          .chain()
          .focus()
          .insertContent({
            type: 'image',
            attrs: {
              src: file.url,
              alt: file.name,
              title: file.name,
              media: metadata
            }
          })
          .run();
        return;
      }

      if (file.type === 'pdf' && file.thumbnail) {
        editor
          .chain()
          .focus()
          .insertContent([
            {
              type: 'image',
              attrs: {
                src: file.thumbnail,
                alt: file.name,
                title: file.name,
                media: metadata
              }
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: file.name,
                  marks: [
                    {
                      type: 'link',
                      attrs: {
                        href: file.url
                      }
                    }
                  ]
                }
              ]
            }
          ])
          .run();
        return;
      }

      // // Fallback for non-image files without thumbnail.
      // if (file.type !== 'image') {
      //   editor
      //     .chain()
      //     .focus()
      //     .insertContent({
      //       type: 'paragraph',
      //       content: [
      //         {
      //           type: 'text',
      //           text: file.name,
      //           marks: [
      //             {
      //               type: 'link',
      //               attrs: {
      //                 href: file.url
      //               }
      //             }
      //           ]
      //         }
      //       ]
      //     })
      //     .run();
      //   return;
      // }
    },
    [editor]
  );

  React.useEffect(() => {
    if (!editor) return;
    const nextContent = normalizeContent(value);
    if (isSameContent(nextContent, lastSyncedContent.current)) return;
    lastSyncedContent.current = nextContent;
    editor.commands.setContent(nextContent, {
      emitUpdate: false,
      parseOptions: {
        preserveWhitespace: true
      }
    });
  }, [value, editor]);

  return (
    <div
      id={id}
      className={cn(
        'post-content-editor bg-card flex flex-col rounded-lg border shadow-sm',
        className
      )}
    >
      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          variant='floating'
          data-plain='true'
          className='post-content-editor__toolbar bg-muted/40 flex flex-wrap gap-2 border-b px-2 py-2'
        >
          <ToolbarSeparator />

          <ToolbarGroup>
            <HeadingDropdownMenu levels={[1, 2, 3, 4]} />
            <ListDropdownMenu
              types={['bulletList', 'orderedList', 'taskList']}
            />
            <BlockquoteButton />
            <CodeBlockButton />
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <MarkButton type='bold' />
            <MarkButton type='italic' />
            <MarkButton type='underline' />
            <MarkButton type='strike' />
            <MarkButton type='code' />
            <ColorHighlightPopover />
            <LinkPopover />
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <TextAlignButton align='left' />
            <TextAlignButton align='center' />
            <TextAlignButton align='right' />
            <TextAlignButton align='justify' />
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <Button
              type='button'
              data-style='ghost'
              onClick={() => setImageDialogOpen(true)}
            >
              Add image
            </Button>
          </ToolbarGroup>

          {isImageSelected ? (
            <>
              <ToolbarSeparator />
              <ToolbarGroup>
                <Button
                  type='button'
                  data-style='ghost'
                  data-active-state={imageAlign === 'left' ? 'on' : 'off'}
                  onClick={() => setImageAlign('left')}
                >
                  Left
                </Button>
                <Button
                  type='button'
                  data-style='ghost'
                  data-active-state={imageAlign === 'center' ? 'on' : 'off'}
                  onClick={() => setImageAlign('center')}
                >
                  Center
                </Button>
                <Button
                  type='button'
                  data-style='ghost'
                  data-active-state={imageAlign === 'right' ? 'on' : 'off'}
                  onClick={() => setImageAlign('right')}
                >
                  Right
                </Button>
              </ToolbarGroup>
              <ToolbarGroup>
                <Button
                  type='button'
                  data-style='ghost'
                  data-active-state={imageWidth === '25%' ? 'on' : 'off'}
                  onClick={() => setImageWidth('25%')}
                >
                  25%
                </Button>
                <Button
                  type='button'
                  data-style='ghost'
                  data-active-state={imageWidth === '50%' ? 'on' : 'off'}
                  onClick={() => setImageWidth('50%')}
                >
                  50%
                </Button>
                <Button
                  type='button'
                  data-style='ghost'
                  data-active-state={imageWidth === '100%' ? 'on' : 'off'}
                  onClick={() => setImageWidth('100%')}
                >
                  100%
                </Button>
                <Button
                  type='button'
                  data-style='ghost'
                  data-active-state={!imageWidth ? 'on' : 'off'}
                  onClick={() => setImageWidth(null)}
                >
                  Auto
                </Button>
              </ToolbarGroup>
            </>
          ) : null}
        </Toolbar>

        <div className='post-content-editor__content px-3 py-3'>
          <EditorContent editor={editor} />
        </div>
      </EditorContext.Provider>

      <FileModal
        isOpen={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        onSelect={handleInsertFromMedia}
        onUploadFromDevice={handleUploadFromDevice}
        title='Insert media'
        description='Upload a new file or pick from Media Manager.'
        types={['image', 'video', 'pdf', 'document']}
        accept='*/*'
      />
    </div>
  );
}
