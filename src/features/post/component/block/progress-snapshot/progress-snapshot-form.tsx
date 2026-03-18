'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslate } from '@/hooks/use-translate';
import { TrendingUp } from 'lucide-react';

export interface ProgressSnapshotData {
  progress: string;
}

export const createEmptyProgressSnapshotData = (): ProgressSnapshotData => ({
  progress: ''
});

const normalizeProgressSnapshotData = (
  value?: ProgressSnapshotData
): ProgressSnapshotData => {
  if (!value || typeof value !== 'object') {
    return createEmptyProgressSnapshotData();
  }

  return {
    progress: typeof value.progress === 'string' ? value.progress : ''
  };
};

type ProgressSnapshotFormProps = {
  value?: ProgressSnapshotData;
  onChange?: (value: ProgressSnapshotData) => void;
};

export function ProgressSnapshotForm({
  value,
  onChange
}: ProgressSnapshotFormProps) {
  const { t } = useTranslate();
  const formData = normalizeProgressSnapshotData(value);

  return (
    <Card>
      <CardHeader className='border-b'>
        <CardTitle className='flex items-center gap-2'>
          <TrendingUp className='size-5' />
          {t('post.blocks.progressSnapshot.title')}
        </CardTitle>
      </CardHeader>

      <CardContent className='space-y-2'>
        <Label htmlFor='progress-snapshot'>
          {t('post.blocks.progressSnapshot.progress')}
        </Label>
        <Input
          id='progress-snapshot'
          value={formData.progress}
          onChange={(event) =>
            onChange?.({
              progress: event.target.value
            })
          }
          placeholder={t('post.blocks.progressSnapshot.enterProgress')}
        />
      </CardContent>
    </Card>
  );
}
