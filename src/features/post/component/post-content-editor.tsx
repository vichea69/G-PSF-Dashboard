'use client';

import * as React from 'react';
import { EditorContent, EditorContext, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { mergeAttributes } from '@tiptap/core';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { TextAlign } from '@tiptap/extension-text-align';
import { Typography } from '@tiptap/extension-typography';
import { Highlight } from '@tiptap/extension-highlight';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Selection } from '@tiptap/extensions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button as UIButton } from '@/components/ui/button';

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
import { useMedia } from '@/features/media/hook/use-media';
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
      }
    };
  },
  renderHTML({ HTMLAttributes }) {
    const { align, width, style, ...rest } = HTMLAttributes as Record<
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

    return [
      'img',
      mergeAttributes(this.options.HTMLAttributes, {
        ...rest,
        style: styles.join(' '),
        'data-align': typeof align === 'string' ? align : undefined,
        'data-width': typeof width === 'string' ? width : undefined
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
  const [mediaSearch, setMediaSearch] = React.useState('');
  const [selectedMediaId, setSelectedMediaId] = React.useState<string | null>(
    null
  );
  const { data: mediaFiles = [], isLoading: mediaLoading } = useMedia();

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

  const handleImageInserted = React.useCallback(() => {
    if (!editor) return;
    requestAnimationFrame(() => {
      const root = editor.view?.dom;
      if (!root) return;
      const nodes = root.querySelectorAll('.tiptap-image-upload');
      const target = nodes[nodes.length - 1] as HTMLElement | undefined;
      target?.click();
    });
  }, [editor]);

  const handleUploadFromDevice = React.useCallback(() => {
    if (!editor) return;
    setImageDialogOpen(false);
    setTimeout(() => {
      const inserted = editor
        .chain()
        .focus()
        .insertContent({ type: 'imageUpload' })
        .run();
      if (inserted) {
        handleImageInserted();
      }
    }, 0);
  }, [editor, handleImageInserted]);

  const imageMedia = React.useMemo(() => {
    const term = mediaSearch.trim().toLowerCase();
    return mediaFiles
      .filter((file) => file.type === 'image')
      .filter((file) => (term ? file.name.toLowerCase().includes(term) : true));
  }, [mediaFiles, mediaSearch]);

  const selectedMedia = React.useMemo(() => {
    if (!selectedMediaId) return null;
    return imageMedia.find((file) => file.id === selectedMediaId) ?? null;
  }, [imageMedia, selectedMediaId]);

  const handleInsertFromMedia = React.useCallback(
    (file: MediaFile | null) => {
      if (!editor || !file) return;
      setImageDialogOpen(false);
      setSelectedMediaId(null);
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'image',
          attrs: {
            src: file.url,
            alt: file.name,
            title: file.name
          }
        })
        .run();
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

      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className='max-w-4xl'>
          <DialogHeader>
            <DialogTitle>Insert image</DialogTitle>
            <DialogDescription>
              Upload a new image or pick from Media Manager.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            <div className='flex flex-wrap items-center gap-2'>
              <UIButton onClick={handleUploadFromDevice}>
                Upload from device
              </UIButton>
            </div>

            <div className='space-y-2'>
              <Input
                placeholder='Search media...'
                value={mediaSearch}
                onChange={(event) => setMediaSearch(event.target.value)}
              />
              <div className='border-muted max-h-[360px] overflow-auto rounded-md border p-3'>
                {mediaLoading ? (
                  <p className='text-muted-foreground text-sm'>
                    Loading media...
                  </p>
                ) : imageMedia.length === 0 ? (
                  <p className='text-muted-foreground text-sm'>
                    No images found.
                  </p>
                ) : (
                  <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'>
                    {imageMedia.map((file) => (
                      <button
                        key={file.id}
                        type='button'
                        className={cn(
                          'border-muted hover:border-primary relative overflow-hidden rounded-md border text-left transition',
                          selectedMediaId === file.id &&
                            'border-primary ring-primary/30 ring-2'
                        )}
                        onClick={() => setSelectedMediaId(file.id)}
                      >
                        <img
                          src={file.thumbnail ?? file.url}
                          alt={file.name}
                          className='h-32 w-full object-cover'
                        />
                        <div className='bg-background/80 text-foreground absolute inset-x-0 bottom-0 truncate px-2 py-1 text-xs'>
                          {file.name}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <UIButton
              variant='outline'
              onClick={() => setImageDialogOpen(false)}
            >
              Cancel
            </UIButton>
            <UIButton
              onClick={() => handleInsertFromMedia(selectedMedia)}
              disabled={!selectedMedia}
            >
              Insert selected
            </UIButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
