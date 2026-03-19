import * as React from 'react';

import { containsKhmerCharacters } from '@/lib/khmer-text';
import { cn } from '@/lib/utils';

function Textarea({
  className,
  style,
  ...props
}: React.ComponentProps<'textarea'>) {
  const currentValue =
    typeof props.value === 'string'
      ? props.value
      : typeof props.defaultValue === 'string'
        ? props.defaultValue
        : '';

  const showKhmerFont = containsKhmerCharacters(currentValue);

  return (
    <textarea
      data-slot='textarea'
      className={cn(
        // Keep textarea text on the shared font token so Khmer labels and form content match.
        'border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 font-sans text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className
      )}
      // Inline fontFamily is stronger for native textarea text rendering.
      style={{
        ...style,
        ...(showKhmerFont
          ? {
              fontFamily: 'var(--font-kantumruy-pro), system-ui, sans-serif'
            }
          : {})
      }}
      {...props}
    />
  );
}

export { Textarea };
