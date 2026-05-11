'use client';

import { Plus, Trash2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  createEmptyContactDesk,
  createEmptyContactLocale,
  type LocaleKey,
  type SiteContact
} from '@/features/site-setting/types/site-setting-types';
import { useTranslate } from '@/hooks/use-translate';

type SiteContactBlockProps = {
  activeLocale: LocaleKey;
  value: SiteContact;
  onChange: (next: SiteContact) => void;
};

export function SiteContactBlock({
  activeLocale,
  value,
  onChange
}: SiteContactBlockProps) {
  const { t } = useTranslate();
  const activeContact = value[activeLocale] ?? createEmptyContactLocale();
  const phones = activeContact.phones.length > 0 ? activeContact.phones : [''];
  const desks =
    activeContact.desks.length > 0
      ? activeContact.desks
      : [createEmptyContactDesk()];
  const shouldShowDesks = activeLocale === 'en';
  const localeLabel =
    activeLocale === 'en'
      ? t('siteSetting.tabs.english')
      : t('siteSetting.tabs.khmer');

  const updateActiveContact = (nextContact: typeof activeContact) => {
    onChange({
      ...value,
      [activeLocale]: nextContact
    });
  };

  const updateActivePhones = (phones: string[]) => {
    updateActiveContact({
      ...activeContact,
      phones,
      desks: activeLocale === 'km' ? [] : activeContact.desks
    });
  };

  const updateActiveDesks = (desks: typeof activeContact.desks) => {
    updateActiveContact({
      ...activeContact,
      desks
    });
  };

  const updatePhone = (index: number, nextValue: string) => {
    const nextPhones = phones.map((phone, phoneIndex) =>
      phoneIndex === index ? nextValue : phone
    );
    updateActivePhones(nextPhones);
  };

  const addPhone = () => {
    updateActivePhones([...phones, '']);
  };

  const removePhone = (index: number) => {
    const nextPhones = phones.filter((_, phoneIndex) => phoneIndex !== index);
    updateActivePhones(nextPhones.length > 0 ? nextPhones : ['']);
  };

  const updateDeskTitle = (deskIndex: number, nextTitle: string) => {
    const nextDesks = desks.map((desk, index) =>
      index === deskIndex ? { ...desk, title: nextTitle } : desk
    );
    updateActiveDesks(nextDesks);
  };

  const addDesk = () => {
    updateActiveDesks([...desks, createEmptyContactDesk()]);
  };

  const removeDesk = (deskIndex: number) => {
    const nextDesks = desks.filter((_, index) => index !== deskIndex);
    updateActiveDesks(
      nextDesks.length > 0 ? nextDesks : [createEmptyContactDesk()]
    );
  };

  const addDeskEmail = (deskIndex: number) => {
    const nextDesks = desks.map((desk, index) =>
      index === deskIndex ? { ...desk, emails: [...desk.emails, ''] } : desk
    );
    updateActiveDesks(nextDesks);
  };

  const updateDeskEmail = (
    deskIndex: number,
    emailIndex: number,
    nextEmail: string
  ) => {
    const nextDesks = desks.map((desk, index) => {
      if (index !== deskIndex) return desk;
      return {
        ...desk,
        emails: desk.emails.map((email, currentEmailIndex) =>
          currentEmailIndex === emailIndex ? nextEmail : email
        )
      };
    });
    updateActiveDesks(nextDesks);
  };

  const removeDeskEmail = (deskIndex: number, emailIndex: number) => {
    const nextDesks = desks.map((desk, index) => {
      if (index !== deskIndex) return desk;
      const nextEmails = desk.emails.filter(
        (_, currentEmailIndex) => currentEmailIndex !== emailIndex
      );
      return {
        ...desk,
        emails: nextEmails.length > 0 ? nextEmails : ['']
      };
    });
    updateActiveDesks(nextDesks);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base font-semibold'>
          {t('siteSetting.contact.title')}
        </CardTitle>
        <CardDescription>
          {t('siteSetting.contact.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <Label>
              {t('siteSetting.contact.phoneNumbers')} ({localeLabel})
            </Label>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={addPhone}
            >
              <Plus className='mr-2 h-4 w-4' />
              {t('siteSetting.contact.addPhone')}
            </Button>
          </div>
          {phones.map((phone, index) => (
            <div
              key={`phone-${activeLocale}-${index}`}
              className='flex items-center gap-2'
            >
              <Input
                value={phone}
                onChange={(event) => updatePhone(index, event.target.value)}
                placeholder={t('siteSetting.contact.phonePlaceholder')}
              />
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={() => removePhone(index)}
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>
          ))}
        </div>

        {shouldShowDesks ? (
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <Label>
                {t('siteSetting.contact.desks')} ({localeLabel})
              </Label>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={addDesk}
              >
                <Plus className='mr-2 h-4 w-4' />
                {t('siteSetting.contact.addDesk')}
              </Button>
            </div>

            {desks.map((desk, deskIndex) => (
              <div
                key={`desk-${activeLocale}-${deskIndex}`}
                className='space-y-3 rounded-md border p-3'
              >
                <div className='flex items-center gap-2'>
                  <Input
                    value={desk.title}
                    onChange={(event) =>
                      updateDeskTitle(deskIndex, event.target.value)
                    }
                    placeholder={t('siteSetting.contact.deskTitlePlaceholder')}
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    onClick={() => removeDesk(deskIndex)}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <Label className='text-xs'>
                      {t('siteSetting.contact.deskEmails')}
                    </Label>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={() => addDeskEmail(deskIndex)}
                    >
                      <Plus className='mr-2 h-4 w-4' />
                      {t('siteSetting.contact.addEmail')}
                    </Button>
                  </div>

                  {desk.emails.map((email, emailIndex) => (
                    <div
                      key={`desk-${activeLocale}-${deskIndex}-email-${emailIndex}`}
                      className='flex items-center gap-2'
                    >
                      <Input
                        value={email}
                        onChange={(event) =>
                          updateDeskEmail(
                            deskIndex,
                            emailIndex,
                            event.target.value
                          )
                        }
                        placeholder={t('siteSetting.contact.emailPlaceholder')}
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={() => removeDeskEmail(deskIndex, emailIndex)}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
