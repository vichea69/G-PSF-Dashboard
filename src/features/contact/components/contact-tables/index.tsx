'use client';

import { useMemo, useState } from 'react';
import { IconSearch } from '@tabler/icons-react';
import CellAction from './cell-action';

type Contact = {
  id: string | number;
  name: string;
  email: string;
  organisationName?: string;
  subject: string;
  isRead: boolean;
};

export default function ContactsTable({ data }: { data: Contact[] }) {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return data;
    return data.filter((x) =>
      [x.name, x.email, x.organisationName ?? '', x.subject].some((v) =>
        (v || '').toLowerCase().includes(s)
      )
    );
  }, [data, q]);

  return (
    <div className='rounded-2xl border border-slate-200 bg-white shadow-sm'>
      {/* top bar */}
      <div className='flex items-center justify-between gap-3 p-4'>
        <div className='relative w-full max-w-sm'>
          <IconSearch className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400' />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder='Search'
            className='h-10 w-full rounded-xl border border-slate-200 bg-white pr-3 pl-9 text-sm outline-none focus:ring-4 focus:ring-slate-100'
          />
        </div>
      </div>

      {/* table */}
      <div className='w-full overflow-x-auto'>
        {/* IMPORTANT: min-width keeps all columns visible */}
        <table className='w-full min-w-[900px] border-collapse'>
          {/* widths must be correct */}
          <colgroup>
            <col style={{ width: '20%' }} />
            <col style={{ width: '22%' }} />
            <col style={{ width: '22%' }} />
            <col style={{ width: '26%' }} />
            <col style={{ width: '6%' }} />
            <col style={{ width: '4%' }} />
          </colgroup>

          <thead>
            <tr className='border-y border-slate-200 bg-slate-50'>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Organisation Name</Th>
              <Th>Subject</Th>
              <Th>Read</Th>
              {/* Actions header */}
              <Th className='text-right'>Actions</Th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className='px-5 py-14'>
                  <div className='flex flex-col items-center justify-center gap-2 text-slate-500'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-full border border-slate-200'>
                      ✕
                    </div>
                    <div className='font-semibold'>No Contacts</div>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr
                  key={row.id}
                  className='border-b border-slate-100 hover:bg-slate-50/60'
                >
                  <Td className='font-medium text-slate-900'>{row.name}</Td>
                  <Td className='text-slate-700'>{row.email}</Td>
                  <Td className='truncate text-slate-700'>
                    {row.organisationName || '-'}
                  </Td>
                  <Td className='truncate text-slate-700'>{row.subject}</Td>

                  <Td>
                    <span
                      className={
                        'inline-flex rounded-full px-2 py-1 text-xs font-semibold ' +
                        (row.isRead
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-blue-50 text-blue-900')
                      }
                    >
                      {row.isRead ? 'Yes' : 'No'}
                    </span>
                  </Td>

                  <Td className='text-right'>
                    <CellAction id={String(row.id)} />
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={
        'px-5 py-4 text-left text-sm font-semibold whitespace-nowrap text-slate-700 ' +
        className
      }
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={'px-5 py-4 text-sm ' + className}>{children}</td>;
}
