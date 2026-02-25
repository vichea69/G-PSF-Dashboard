'use client';

import { useMemo, useState } from 'react';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { useContacts } from '@/features/contact/hook/use-contact';
import type { Contact as ContactEntity } from '@/server/action/contact/types';
import ContactsTable from './contact-tables';
import type { ContactRow } from './contact-tables/columns';

const getDisplayName = (contact: ContactEntity) =>
  `${contact.firstName ?? ''} ${contact.lastName ?? ''}`.trim() ||
  contact.email ||
  'Unknown';

const mapContactRow = (contact: ContactEntity): ContactRow => ({
  id: contact.id,
  name: getDisplayName(contact),
  email: contact.email ?? '',
  organisationName: contact.organisationName ?? '',
  subject: contact.subject ?? '',
  message: contact.message ?? '',
  isRead: Boolean(contact.isRead),
  createdAt: contact.createdAt ?? ''
});

export default function ContactsViewPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data, isLoading } = useContacts({ page, limit: pageSize });

  const rows = useMemo(() => {
    const list = data?.items ?? [];
    return list.map(mapContactRow);
  }, [data?.items]);

  const pageCount = Math.max(1, data?.meta?.totalPages ?? 1);
  const currentPage = data?.meta?.page ?? page;
  const currentPageSize = data?.meta?.limit ?? pageSize;

  if (isLoading) {
    return <DataTableSkeleton columnCount={7} rowCount={8} filterCount={1} />;
  }

  return (
    <ContactsTable
      data={rows}
      page={currentPage}
      pageSize={currentPageSize}
      pageCount={pageCount}
      onPageChange={setPage}
      onPageSizeChange={(nextPageSize) => {
        setPageSize(nextPageSize);
        setPage(1);
      }}
    />
  );
}
