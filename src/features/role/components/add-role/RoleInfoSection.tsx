'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslate } from '@/hooks/use-translate';

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
  const { t } = useTranslate();

  return (
    <div className='grid gap-6 sm:grid-cols-2'>
      <div className='space-y-2'>
        <Label htmlFor='role-name'>{t('role.form.roleName')}</Label>
        <Input
          id='role-name'
          placeholder={t('role.form.roleNamePlaceholder')}
          value={name}
          disabled={disabled}
          onChange={(event) => onNameChange(event.target.value)}
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='role-description'>{t('role.form.description')}</Label>
        <Input
          id='role-description'
          placeholder={t('role.form.descriptionPlaceholder')}
          value={description}
          disabled={disabled}
          onChange={(event) => onDescriptionChange(event.target.value)}
        />
      </div>
    </div>
  );
}
