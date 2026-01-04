'use client';

import * as React from 'react';
import { EditorContent, EditorContext, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { TextAlign } from '@tiptap/extension-text-align';
import { Typography } from '@tiptap/extension-typography';
import { Highlight } from '@tiptap/extension-highlight';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Selection } from '@tiptap/extensions';

import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator
} from '@/components/tiptap-ui-primitive/toolbar';
import { HeadingDropdownMenu } from '@/components/tiptap-ui/heading-dropdown-menu';
import { ListDropdownMenu } from '@/components/tiptap-ui/list-dropdown-menu';
import { BlockquoteButton } from '@/components/tiptap-ui/blockquote-button';
import { CodeBlockButton } from '@/components/tiptap-ui/code-block-button';
import { MarkButton } from '@/components/tiptap-ui/mark-button';
import { ColorHighlightPopover } from '@/components/tiptap-ui/color-highlight-popover';
import { LinkPopover } from '@/components/tiptap-ui/link-popover';
import { TextAlignButton } from '@/components/tiptap-ui/text-align-button';
import { ImageUploadButton } from '@/components/tiptap-ui/image-upload-button';

import { HorizontalRule } from '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension';
import { ImageUploadNode } from '@/components/tiptap-node/image-upload-node/image-upload-node-extension';
import '@/components/tiptap-node/blockquote-node/blockquote-node.scss';
import '@/components/tiptap-node/code-block-node/code-block-node.scss';
import '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss';
import '@/components/tiptap-node/list-node/list-node.scss';
import '@/components/tiptap-node/image-node/image-node.scss';
import '@/components/tiptap-node/heading-node/heading-node.scss';
import '@/components/tiptap-node/paragraph-node/paragraph-node.scss';

import { handleImageUpload, MAX_FILE_SIZE } from '@/lib/tiptap-utils';
import { cn } from '@/lib/utils';
import type { PostContent } from '@/server/action/post/types';

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
      Image,
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
            <ImageUploadButton text='Add image' />
          </ToolbarGroup>
        </Toolbar>

        <div className='post-content-editor__content px-3 py-3'>
          <EditorContent editor={editor} />
        </div>
      </EditorContext.Provider>
    </div>
  );
}
