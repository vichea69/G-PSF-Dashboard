import React from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface PermissionCheckboxProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
}

// Simple checkbox + label block so we can reuse it in multiple sections.
export const PermissionCheckbox: React.FC<PermissionCheckboxProps> = ({
  id,
  checked,
  onCheckedChange,
  label
}) => {
  return (
    <div className='border-border/60 bg-card flex items-start gap-3 rounded-lg border px-3 py-3'>
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(state) => onCheckedChange(state === true)}
        className='mt-0.5'
      />
      <Label htmlFor={id} className='text-sm leading-5 font-medium'>
        {label}
      </Label>
    </div>
  );
};
