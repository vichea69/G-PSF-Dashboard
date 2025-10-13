import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type RoleInfoSectionProps = {
  name: string;
  description: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
};

export function RoleInfoSection({
  name,
  description,
  onNameChange,
  onDescriptionChange
}: RoleInfoSectionProps) {
  return (
    <div className='grid gap-6 sm:grid-cols-2'>
      <div className='space-y-2'>
        <Label htmlFor='role-name'>
          Role name
          <span aria-hidden className='text-destructive'>
            *
          </span>
        </Label>
        <Input
          id='role-name'
          placeholder='Enter role name'
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
        />
      </div>

      <div className='space-y-2 sm:col-span-2'>
        <Label htmlFor='role-description'>Description</Label>
        <Textarea
          id='role-description'
          placeholder='Optional details for this role'
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
}
