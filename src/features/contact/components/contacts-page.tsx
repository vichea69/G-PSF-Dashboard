import { getContacts } from '@/server/action/contact/contact';
import ContactsTable from './contact-tables';

export type Contact = {
  id: string | number;
  firstName?: string;
  lastName?: string;
  name: string;
  email: string;
  organisationName?: string;
  subject: string;
  message?: string;
  isRead: boolean;
};

export default async function ContactsViewPage() {
  const res = await getContacts({ page: 1, limit: 20 }); // change limit if you want

  //  map backend fields to your table shape
  const contacts: Contact[] = (res?.items ?? []).map((c: any) => ({
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    name: `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim(),
    email: c.email,
    organisationName: c.organisationName ?? '',
    subject: c.subject,
    message: c.message,
    isRead: !!c.isRead
  }));

  return <ContactsTable data={contacts} />;
}
