export type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  organisationName?: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ListContactResponse = {
  items: Contact[];
  meta: PaginationMeta;
};
