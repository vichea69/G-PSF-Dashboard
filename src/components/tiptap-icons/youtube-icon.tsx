import * as React from 'react';

export const YoutubeIcon = React.memo(
  ({ className, ...props }: React.SVGProps<SVGSVGElement>) => {
    return (
      <svg
        width='24'
        height='24'
        className={className}
        viewBox='0 0 24 24'
        fill='currentColor'
        xmlns='http://www.w3.org/2000/svg'
        {...props}
      >
        <path
          fillRule='evenodd'
          clipRule='evenodd'
          d='M22.54 6.42a2.78 2.78 0 0 0-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 0 0 1.95-1.97A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58ZM10 15.5v-7l6 3.5-6 3.5Z'
          fill='currentColor'
        />
      </svg>
    );
  }
);

YoutubeIcon.displayName = 'YoutubeIcon';
