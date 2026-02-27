'use client';

import * as React from 'react';
import type { Editor } from '@tiptap/react';
import { useTiptapEditor } from '@/hooks/use-tiptap-editor';
import { isNodeInSchema } from '@/lib/tiptap-utils';
import { YoutubeIcon } from '@/components/tiptap-icons/youtube-icon';
import type { ButtonProps } from '@/components/tiptap-ui-primitive/button';
import { Button } from '@/components/tiptap-ui-primitive/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/tiptap-ui-primitive/popover';
import { Card, CardBody } from '@/components/tiptap-ui-primitive/card';
import { Input, InputGroup } from '@/components/tiptap-ui-primitive/input';

function isValidVideoId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{11}$/.test(id);
}

function parseYouTubeId(rawValue: string): string | null {
  const value = rawValue.trim();
  if (!value) return null;

  if (isValidVideoId(value)) {
    return value;
  }

  let normalized = value;
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }

  try {
    const url = new URL(normalized);
    const host = url.hostname.replace(/^www\./, '').toLowerCase();

    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0] ?? '';
      return isValidVideoId(id) ? id : null;
    }

    if (
      host === 'youtube.com' ||
      host === 'm.youtube.com' ||
      host === 'music.youtube.com' ||
      host === 'youtube-nocookie.com'
    ) {
      const fromQuery = url.searchParams.get('v');
      if (fromQuery && isValidVideoId(fromQuery)) {
        return fromQuery;
      }

      const parts = url.pathname.split('/').filter(Boolean);
      const fromPath =
        parts[0] === 'shorts' || parts[0] === 'embed' ? parts[1] : null;

      return fromPath && isValidVideoId(fromPath) ? fromPath : null;
    }
  } catch {
    return null;
  }

  return null;
}

function toYouTubeEmbedUrl(rawValue: string): string | null {
  const videoId = parseYouTubeId(rawValue);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}

export interface VideoPopoverProps extends Omit<ButtonProps, 'type'> {
  editor?: Editor | null;
}

export const VideoButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Button
        type='button'
        className={className}
        data-style='ghost'
        role='button'
        tabIndex={-1}
        aria-label='Video'
        tooltip='YouTube Video'
        ref={ref}
        {...props}
      >
        {children || <YoutubeIcon className='tiptap-button-icon' />}
      </Button>
    );
  }
);

VideoButton.displayName = 'VideoButton';

export const VideoPopover = React.forwardRef<
  HTMLButtonElement,
  VideoPopoverProps
>(({ editor: providedEditor, onClick, children, ...buttonProps }, ref) => {
  const { editor } = useTiptapEditor(providedEditor);
  const [isOpen, setIsOpen] = React.useState(false);
  const [videoUrl, setVideoUrl] = React.useState('');

  const hasYoutubeNode = isNodeInSchema('youtube', editor);
  const embedUrl = React.useMemo(() => toYouTubeEmbedUrl(videoUrl), [videoUrl]);

  const canInsert = Boolean(editor?.isEditable && hasYoutubeNode && embedUrl);

  const insertVideo = React.useCallback(() => {
    if (!editor || !embedUrl) return;

    editor
      .chain()
      .focus()
      .insertContent({
        type: 'youtube',
        attrs: {
          src: embedUrl
        }
      })
      .run();

    setVideoUrl('');
    setIsOpen(false);
  }, [editor, embedUrl]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      insertVideo();
    },
    [insertVideo]
  );

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      setIsOpen((prev) => !prev);
    },
    [onClick]
  );

  if (!editor || !hasYoutubeNode) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <VideoButton
          disabled={!editor.isEditable}
          data-disabled={!editor.isEditable}
          onClick={handleClick}
          {...buttonProps}
          ref={ref}
        >
          {children}
        </VideoButton>
      </PopoverTrigger>

      <PopoverContent align='start'>
        <Card>
          <CardBody>
            <p className='mb-2 text-sm font-medium'>Add YouTube URL</p>
            <div className='flex items-center gap-2'>
              <InputGroup>
                <Input
                  type='url'
                  placeholder='https://www.youtube.com/watch?v=...'
                  value={videoUrl}
                  onChange={(event) => setVideoUrl(event.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  autoComplete='off'
                  autoCorrect='off'
                  autoCapitalize='off'
                />
              </InputGroup>
              <Button
                type='button'
                onClick={insertVideo}
                data-style='ghost'
                disabled={!canInsert}
              >
                Add video
              </Button>
            </div>
            {videoUrl.trim().length > 0 && !embedUrl ? (
              <p className='mt-2 text-xs text-red-500'>
                Invalid YouTube URL. Please check and try again.
              </p>
            ) : null}
          </CardBody>
        </Card>
      </PopoverContent>
    </Popover>
  );
});

VideoPopover.displayName = 'VideoPopover';

export default VideoPopover;
