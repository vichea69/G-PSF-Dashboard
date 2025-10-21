'use client';

import * as React from 'react';
import Image from 'next/image';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type PhoneInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange'
> & {
  value?: string;
  onChange?: (value: string) => void;
  inputClassName?: string;
};

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, inputClassName, value, onChange, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(event.target.value);
    };

    return (
      <div className={cn('flex w-full items-stretch', className)}>
        <span className='border-input bg-muted text-muted-foreground flex items-center gap-2 rounded-l-md border px-3 text-sm'>
          <Image
            src='/assets/kh.svg'
            alt='Cambodia flag'
            width={24}
            height={16}
            className='h-4 w-6 rounded-sm object-cover'
            priority={false}
          />
          <span>+855</span>
        </span>
        <Input
          ref={ref}
          value={value ?? ''}
          onChange={handleChange}
          inputMode='tel'
          {...props}
          className={cn('rounded-l-none border-l-0', inputClassName)}
        />
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

export { PhoneInput };
