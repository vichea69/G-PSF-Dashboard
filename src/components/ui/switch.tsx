'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Switch as SwitchPrimitive } from 'radix-ui';

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot='switch'
      className={cn(
        'peer border-input bg-background ring-offset-background focus-visible:ring-ring data-[state=checked]:bg-primary data-[state=checked]:border-primary inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          'bg-primary-foreground pointer-events-none block h-4 w-4 translate-x-0 rounded-full shadow transition-transform data-[state=checked]:translate-x-4'
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
