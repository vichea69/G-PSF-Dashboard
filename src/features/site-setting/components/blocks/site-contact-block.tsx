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
import type { SiteContact } from '@/features/site-setting/types/site-setting-types';

type SiteContactBlockProps = {
  value: SiteContact;
  onChange: (next: SiteContact) => void;
};

export function SiteContactBlock({ value, onChange }: SiteContactBlockProps) {
  const phones = value.en.phones;
  const desks = value.en.desks;

  const updatePhone = (index: number, nextValue: string) => {
    const nextPhones = phones.map((phone, phoneIndex) =>
      phoneIndex === index ? nextValue : phone
    );
    onChange({
      ...value,
      en: {
        ...value.en,
        phones: nextPhones
      }
    });
  };

  const addPhone = () => {
    onChange({
      ...value,
      en: {
        ...value.en,
        phones: [...phones, '']
      }
    });
  };

  const removePhone = (index: number) => {
    const nextPhones = phones.filter((_, phoneIndex) => phoneIndex !== index);
    onChange({
      ...value,
      en: {
        ...value.en,
        phones: nextPhones.length > 0 ? nextPhones : ['']
      }
    });
  };

  const updateDeskTitle = (deskIndex: number, nextTitle: string) => {
    const nextDesks = desks.map((desk, index) =>
      index === deskIndex ? { ...desk, title: nextTitle } : desk
    );
    onChange({
      ...value,
      en: {
        ...value.en,
        desks: nextDesks
      }
    });
  };

  const addDesk = () => {
    onChange({
      ...value,
      en: {
        ...value.en,
        desks: [...desks, { title: '', emails: [''] }]
      }
    });
  };

  const removeDesk = (deskIndex: number) => {
    const nextDesks = desks.filter((_, index) => index !== deskIndex);
    onChange({
      ...value,
      en: {
        ...value.en,
        desks: nextDesks.length > 0 ? nextDesks : [{ title: '', emails: [''] }]
      }
    });
  };

  const addDeskEmail = (deskIndex: number) => {
    const nextDesks = desks.map((desk, index) =>
      index === deskIndex ? { ...desk, emails: [...desk.emails, ''] } : desk
    );
    onChange({
      ...value,
      en: {
        ...value.en,
        desks: nextDesks
      }
    });
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
    onChange({
      ...value,
      en: {
        ...value.en,
        desks: nextDesks
      }
    });
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
    onChange({
      ...value,
      en: {
        ...value.en,
        desks: nextDesks
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base font-semibold'>Contact</CardTitle>
        <CardDescription>
          Manage phone numbers and desk emails for the contact section.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <Label>Phone Numbers</Label>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={addPhone}
            >
              <Plus className='mr-2 h-4 w-4' />
              Add Phone
            </Button>
          </div>
          {phones.map((phone, index) => (
            <div key={`phone-${index}`} className='flex items-center gap-2'>
              <Input
                value={phone}
                onChange={(event) => updatePhone(index, event.target.value)}
                placeholder='+855 99 799 579'
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

        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <Label>Desks</Label>
            <Button type='button' variant='outline' size='sm' onClick={addDesk}>
              <Plus className='mr-2 h-4 w-4' />
              Add Desk
            </Button>
          </div>

          {desks.map((desk, deskIndex) => (
            <div
              key={`desk-${deskIndex}`}
              className='space-y-3 rounded-md border p-3'
            >
              <div className='flex items-center gap-2'>
                <Input
                  value={desk.title}
                  onChange={(event) =>
                    updateDeskTitle(deskIndex, event.target.value)
                  }
                  placeholder='Desk title (General, China Desk...)'
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
                  <Label className='text-xs'>Desk Emails</Label>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => addDeskEmail(deskIndex)}
                  >
                    <Plus className='mr-2 h-4 w-4' />
                    Add Email
                  </Button>
                </div>

                {desk.emails.map((email, emailIndex) => (
                  <div
                    key={`desk-${deskIndex}-email-${emailIndex}`}
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
                      placeholder='desk@example.com'
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
      </CardContent>
    </Card>
  );
}
