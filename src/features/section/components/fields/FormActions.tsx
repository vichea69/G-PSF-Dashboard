import { Button } from '@/components/ui/button';

type Props = {
  submitting: boolean;
  isEditing: boolean;
  onCancel: () => void;
};

export function FormActions({ submitting, isEditing, onCancel }: Props) {
  return (
    <div className='flex items-center justify-end gap-2'>
      <Button type='submit' disabled={submitting}>
        {isEditing ? 'Save Changes' : 'Create Section'}
      </Button>
      <Button type='button' variant='outline' onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}
