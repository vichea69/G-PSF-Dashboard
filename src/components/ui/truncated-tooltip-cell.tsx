'use client';

import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';

type TruncatedTooltipCellProps = {
  text?: string | null;
  widthClassName?: string;
  tooltipClassName?: string;
  minLength?: number;
  fallback?: string;
};

export function TruncatedTooltipCell({
  text,
  widthClassName = 'block w-[7rem] truncate sm:w-[9rem] lg:w-[12rem]',
  tooltipClassName = 'max-w-[20rem] break-all',
  minLength = 12,
  fallback = '-'
}: TruncatedTooltipCellProps) {
  const value = (text ?? '').trim();
  if (!value) return <span className='text-muted-foreground'>{fallback}</span>;

  const content = <span className={cn(widthClassName)}>{value}</span>;
  if (value.length <= minLength) return content;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent className={tooltipClassName}>{value}</TooltipContent>
    </Tooltip>
  );
}
