'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateContact } from '@/features/contact/hook/use-contact';
import { useTranslate } from '@/hooks/use-translate';

export type ContactFormData = {
  id?: string | number;
  firstName?: string;
  lastName?: string;
  name?: string;

  email: string;
  organisationName?: string | null;
  subject: string;
  message?: string;
  isRead?: boolean;
};

export default function ContactForm({
  initialData
}: {
  initialData: ContactFormData | null;
}) {
  const router = useRouter();
  const updateContactMutation = useUpdateContact();
  const { t } = useTranslate();

  const [form, setForm] = useState<ContactFormData>(
    initialData ?? {
      firstName: '',
      lastName: '',
      email: '',
      organisationName: '',
      subject: '',
      message: '',
      isRead: false
    }
  );

  const [loading, setLoading] = useState(false);

  const set = <K extends keyof ContactFormData>(
    key: K,
    value: ContactFormData[K]
  ) => setForm((p) => ({ ...p, [key]: value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Edit mode only (View/Edit Contact)
    if (!initialData?.id) return;

    setLoading(true);
    try {
      await updateContactMutation.mutateAsync({
        id: String(initialData.id),
        body: {
          firstName: form.firstName?.trim() || '',
          lastName: form.lastName?.trim() || '',
          email: form.email?.trim() || '',
          organisationName: form.organisationName?.trim() || null,
          subject: form.subject?.trim() || '',
          message: form.message?.trim() || '',
          isRead: !!form.isRead
        }
      });

      toast.success(t('contact.toast.updated'));
      router.push('/admin/contact');
    } catch (err: any) {
      toast.error(err?.message || t('contact.toast.saveFailed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className='bg-card text-card-foreground space-y-6 rounded-2xl border p-6'
    >
      <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
        <Field label={t('contact.form.firstName')} htmlFor='firstName'>
          <Input
            id='firstName'
            variant='lg'
            className='h-12 rounded-xl'
            placeholder={t('contact.form.firstNamePlaceholder')}
            value={form.firstName ?? ''}
            onChange={(e) => set('firstName', e.target.value)}
          />
        </Field>

        <Field label={t('contact.form.lastName')} htmlFor='lastName'>
          <Input
            id='lastName'
            variant='lg'
            className='h-12 rounded-xl'
            placeholder={t('contact.form.lastNamePlaceholder')}
            value={form.lastName ?? ''}
            onChange={(e) => set('lastName', e.target.value)}
          />
        </Field>

        <Field label={t('contact.form.email')} required htmlFor='email'>
          <Input
            id='email'
            type='email'
            variant='lg'
            className='h-12 rounded-xl'
            placeholder={t('contact.form.emailPlaceholder')}
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
          />
        </Field>

        <Field
          label={t('contact.form.organisationName')}
          htmlFor='organisationName'
        >
          <Input
            id='organisationName'
            variant='lg'
            className='h-12 rounded-xl'
            placeholder={t('contact.form.organisationPlaceholder')}
            value={form.organisationName ?? ''}
            onChange={(e) => set('organisationName', e.target.value)}
          />
        </Field>
      </div>

      <Field label={t('contact.form.subject')} required htmlFor='subject'>
        <Input
          id='subject'
          variant='lg'
          className='h-12 rounded-xl'
          placeholder={t('contact.form.subjectPlaceholder')}
          value={form.subject}
          onChange={(e) => set('subject', e.target.value)}
        />
      </Field>

      <Field label={t('contact.form.message')} required htmlFor='message'>
        <Textarea
          id='message'
          placeholder={t('contact.form.messagePlaceholder')}
          value={form.message ?? ''}
          onChange={(e) => set('message', e.target.value)}
          className='min-h-[200px] resize-none rounded-xl'
        />
      </Field>

      <div className='flex items-center justify-between'>
        <label
          htmlFor='isRead'
          className='text-foreground flex cursor-pointer items-center gap-2 text-sm font-medium'
        >
          <Checkbox
            id='isRead'
            checked={!!form.isRead}
            onCheckedChange={(checked) => set('isRead', checked === true)}
            className='h-4 w-4'
          />
          {t('contact.form.markAsRead')}
        </label>

        <Button
          type='submit'
          disabled={loading}
          variant='primary'
          appearance='default'
        >
          {loading
            ? t('contact.form.saving')
            : initialData
              ? t('contact.form.saveChanges')
              : t('contact.form.sendMessage')}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  required,
  children
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className='space-y-2'>
      <Label
        htmlFor={htmlFor}
        className='text-foreground text-sm font-semibold'
      >
        {label}
        {required ? <span className='text-destructive ml-1'>*</span> : null}
      </Label>
      {children}
    </div>
  );
}
