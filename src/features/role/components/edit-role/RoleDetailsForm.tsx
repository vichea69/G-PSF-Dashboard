'use client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RoleDetailsForm({
  roleName,
  guardName,
  onRoleName,
  onGuardName
}: {
  roleName: string;
  guardName: string;
  onRoleName: (value: string) => void;
  onGuardName: (value: string) => void;
}) {
  return (
    <div className='grid gap-6 sm:grid-cols-2'>
      <div className='space-y-2'>
        <Label htmlFor='role-name'>
          Role Name
          <span className='text-destructive' aria-hidden='true'>
            *
          </span>
        </Label>
        <Input
          id='role-name'
          value={roleName}
          onChange={(event) => onRoleName(event.target.value)}
          placeholder='your_name'
          required
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='guard-name'>Description</Label>
        <Input
          id='guard-name'
          value={guardName}
          onChange={(event) => onGuardName(event.target.value)}
          placeholder='About this role...'
        />
      </div>
    </div>
  );
}
