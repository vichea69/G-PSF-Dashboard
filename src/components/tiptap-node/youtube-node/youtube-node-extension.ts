import { mergeAttributes, Node } from '@tiptap/react';

type YouTubeNodeAttributes = {
  src?: string | null;
  width?: string | null;
  height?: string | null;
  allowfullscreen?: string | null;
  title?: string | null;
};

export const YouTubeNode = Node.create({
  name: 'youtube',

  group: 'block',

  atom: true,

  draggable: true,

  selectable: true,

  addOptions() {
    return {
      HTMLAttributes: {}
    };
  },

  addAttributes() {
    return {
      src: {
        default: null
      },
      width: {
        default: '100%'
      },
      height: {
        default: '100%'
      },
      allowfullscreen: {
        default: 'true'
      },
      title: {
        default: 'YouTube video player'
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-youtube-video] iframe'
      }
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const attrs = HTMLAttributes as YouTubeNodeAttributes;

    return [
      'div',
      { 'data-youtube-video': 'true' },
      [
        'iframe',
        mergeAttributes(this.options.HTMLAttributes, {
          ...attrs,
          frameborder: '0',
          loading: 'lazy',
          referrerpolicy: 'strict-origin-when-cross-origin',
          allow:
            'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
        })
      ]
    ];
  }
});

export default YouTubeNode;
