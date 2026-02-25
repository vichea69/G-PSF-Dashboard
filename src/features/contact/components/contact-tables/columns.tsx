import CellAction from './cell-action';

type Contact = {
  id: string | number;
  name: string;
  email: string;
  subject: string;
  isRead: boolean;
};

export const columns: Array<{
  key: string;
  header: string;
  cell: (row: Contact) => any;
}> = [
  { key: 'name', header: 'Name', cell: (r) => r.name },
  { key: 'email', header: 'Email', cell: (r) => r.email },
  { key: 'subject', header: 'Subject', cell: (r) => r.subject },
  {
    key: 'read',
    header: 'Read',
    cell: (r) => (
      <span
        className={
          'inline-flex rounded-full px-2 py-1 text-xs font-semibold ' +
          (r.isRead
            ? 'bg-slate-100 text-slate-700'
            : 'bg-blue-50 text-blue-900')
        }
      >
        {r.isRead ? 'Yes' : 'No'}
      </span>
    )
  },
  { key: 'actions', header: '', cell: (r) => <CellAction id={String(r.id)} /> }
];
