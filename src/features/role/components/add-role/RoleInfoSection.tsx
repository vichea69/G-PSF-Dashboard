import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type RoleInfoSectionProps = {
  name: string;
  description: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  disabled?: boolean;
};

export function RoleInfoSection({
  name,
  description,
  onNameChange,
  onDescriptionChange,
  disabled = false
}: RoleInfoSectionProps) {
  return (
    <div className='grid gap-6 sm:grid-cols-2'>
      <div className='space-y-2'>
        <Label htmlFor='role-name'>Role name</Label>
        <Input
          id='role-name'
          placeholder='Enter role name'
          value={name}
          disabled={disabled}
          onChange={(event) => onNameChange(event.target.value)}
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='role-description'>Description</Label>
        <Input
          id='role-description'
          placeholder='short description about this role'
          value={description}
          disabled={disabled}
          onChange={(event) => onDescriptionChange(event.target.value)}
        />
      </div>
    </div>
  );
}
