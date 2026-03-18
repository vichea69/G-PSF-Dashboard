import { Button } from '@/components/ui/button';
import { useTranslate } from '@/hooks/use-translate';

type Props = {
  submitting: boolean;
  isEditing: boolean;
  onCancel: () => void;
};

export function FormActions({ submitting, isEditing, onCancel }: Props) {
  const { t } = useTranslate();

  return (
    <div className='flex items-center justify-end gap-2'>
      <Button type='submit' disabled={submitting}>
        {isEditing
          ? t('section.form.saveChanges')
          : t('section.form.createSubmit')}
      </Button>
      <Button type='button' variant='outline' onClick={onCancel}>
        {t('section.form.cancel')}
      </Button>
    </div>
  );
}
