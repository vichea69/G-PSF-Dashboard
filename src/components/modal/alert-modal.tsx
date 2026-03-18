'use client';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useTranslate } from '@/hooks/use-translate';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const { t } = useTranslate();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Modal
      title={t('confirmDialog.title')}
      description={t('confirmDialog.description')}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className='flex w-full items-center justify-end space-x-2 pt-6'>
        <Button disabled={loading} variant='outline' onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button
          disabled={loading}
          variant='destructive'
          appearance='default'
          onClick={onConfirm}
        >
          {t('common.continue')}
        </Button>
      </div>
    </Modal>
  );
};
