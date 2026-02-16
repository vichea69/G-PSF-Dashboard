'use client';

import { Facebook, MessageCircle, Send } from 'lucide-react';

const contactPhones = ['+855 99 799 579', '+855 98 799 579'];

const generalEmails = ['helpdesk@cdc.gov.kh', 'info@cdc.gov.kh'];

const deskEmails = [
  { title: 'China Desk', email: 'chinadesk@cdc.gov.kh' },
  { title: 'EU Desk', email: 'eudesk@cdc.gov.kh' },
  { title: 'Japan Desk', email: 'japandesk@cdc.gov.kh' },
  { title: 'Korea Desk', email: 'koreadesk@cdc.gov.kh' }
];

const socialButtons = [
  { label: 'Facebook', icon: Facebook },
  { label: 'Telegram', icon: Send },
  { label: 'Message', icon: MessageCircle }
];

export function AddressForm() {
  return (
    <div className='rounded-xl bg-[#1f265e] p-6 text-white md:p-8'>
      <div className='space-y-10'>
        <section className='space-y-4'>
          <h3 className='text-4xl font-semibold'>Address</h3>
          <p className='max-w-xl text-lg leading-9 text-white/80'>
            Government Palace, Sisowath Quay,
            <br />
            Wat Phnom, Phnom Penh, Cambodia
          </p>
        </section>

        <section className='space-y-4'>
          <h3 className='text-4xl font-semibold'>Contact</h3>
          <div className='space-y-2 text-lg text-white/90'>
            {contactPhones.map((phone) => (
              <p key={phone}>{phone}</p>
            ))}
          </div>
        </section>

        <section className='space-y-4'>
          <h4 className='text-2xl font-semibold'>General</h4>
          <div className='space-y-2 text-lg text-white/90'>
            {generalEmails.map((email) => (
              <p key={email}>{email}</p>
            ))}
          </div>
        </section>

        <section className='space-y-8'>
          {deskEmails.map((desk) => (
            <div key={desk.title} className='space-y-2'>
              <h4 className='text-2xl font-semibold'>{desk.title}</h4>
              <p className='text-lg text-white/80'>{desk.email}</p>
            </div>
          ))}
        </section>

        <section className='space-y-4'>
          <h3 className='text-4xl font-semibold'>Open Time</h3>
          <p className='text-lg leading-9 text-white/80'>
            From Monday to Friday
            <br />
            7:30 to 11:30am and 14:00 to 17:30pm
          </p>
        </section>

        <section className='space-y-6'>
          <h3 className='text-4xl font-semibold'>Stay Connected</h3>
          <div className='flex items-center gap-5'>
            {socialButtons.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type='button'
                  className='inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#f39b2f] text-white'
                  aria-label={item.label}
                >
                  <Icon className='h-7 w-7' />
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
