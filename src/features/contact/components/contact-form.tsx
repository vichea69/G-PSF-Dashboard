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

      toast.success('Contact updated');
      router.push('/admin/contact');
    } catch (err: any) {
      toast.error(err?.message || 'Save error');
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
        <Field label='First Name' htmlFor='firstName'>
          <Input
            id='firstName'
            variant='lg'
            className='h-12 rounded-xl'
            placeholder='Ex. Pheak'
            value={form.firstName ?? ''}
            onChange={(e) => set('firstName', e.target.value)}
          />
        </Field>

        <Field label='Last Name' htmlFor='lastName'>
          <Input
            id='lastName'
            variant='lg'
            className='h-12 rounded-xl'
            placeholder='Ex. Kdey'
            value={form.lastName ?? ''}
            onChange={(e) => set('lastName', e.target.value)}
          />
        </Field>

        <Field label='Email' required htmlFor='email'>
          <Input
            id='email'
            type='email'
            variant='lg'
            className='h-12 rounded-xl'
            placeholder='example@gmail.com'
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
          />
        </Field>

        <Field label='Organisation Name' htmlFor='organisationName'>
          <Input
            id='organisationName'
            variant='lg'
            className='h-12 rounded-xl'
            placeholder='Enter Organisation Name'
            value={form.organisationName ?? ''}
            onChange={(e) => set('organisationName', e.target.value)}
          />
        </Field>
      </div>

      <Field label='Subject' required htmlFor='subject'>
        <Input
          id='subject'
          variant='lg'
          className='h-12 rounded-xl'
          placeholder='Enter subject here...'
          value={form.subject}
          onChange={(e) => set('subject', e.target.value)}
        />
      </Field>

      <Field label='Your Message' required htmlFor='message'>
        <Textarea
          id='message'
          placeholder='Enter here...'
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
          Mark as read
        </label>

        <Button
          type='submit'
          disabled={loading}
          variant='primary'
          appearance='default'
        >
          {loading
            ? 'Saving...'
            : initialData
              ? 'Save Changes'
              : 'Send Message'}
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
