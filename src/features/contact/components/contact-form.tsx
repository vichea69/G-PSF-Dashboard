'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
      className='space-y-6 rounded-2xl border border-slate-200 bg-white p-6'
    >
      <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
        <Field label='First Name'>
          <Input
            placeholder='Ex. Pheak'
            value={form.firstName ?? ''}
            onChange={(e) => set('firstName', e.target.value)}
          />
        </Field>

        <Field label='Last Name'>
          <Input
            placeholder='Ex. Kdey'
            value={form.lastName ?? ''}
            onChange={(e) => set('lastName', e.target.value)}
          />
        </Field>

        <Field label='Email' required>
          <Input
            type='email'
            placeholder='example@gmail.com'
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
          />
        </Field>

        <Field label='Organisation Name'>
          <Input
            placeholder='Enter Organisation Name'
            value={form.organisationName ?? ''}
            onChange={(e) => set('organisationName', e.target.value)}
          />
        </Field>
      </div>

      <Field label='Subject' required>
        <Input
          placeholder='Enter subject here...'
          value={form.subject}
          onChange={(e) => set('subject', e.target.value)}
        />
      </Field>

      <Field label='Your Message' required>
        <textarea
          placeholder='Enter here...'
          value={form.message ?? ''}
          onChange={(e) => set('message', e.target.value)}
          className='min-h-[200px] w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-slate-100'
        />
      </Field>

      <div className='flex items-center justify-between'>
        <label className='flex items-center gap-2 text-sm text-slate-700'>
          <input
            type='checkbox'
            checked={!!form.isRead}
            onChange={(e) => set('isRead', e.target.checked)}
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
  required,
  children
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className='space-y-2'>
      <div className='text-base font-bold text-slate-900'>
        {label} {required ? <span className='text-orange-500'>*</span> : null}
      </div>
      {children}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className='h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:ring-4 focus:ring-slate-100'
    />
  );
}
