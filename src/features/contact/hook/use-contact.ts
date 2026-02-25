'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createContact as createContactAction,
  deleteContact as deleteContactAction,
  getContacts as getContactsAction,
  markContactRead as markContactReadAction,
  updateContact as updateContactAction
} from '@/server/action/contact/contact';
import type {
  Contact,
  ListContactResponse
} from '@/server/action/contact/types';

export const CONTACTS_QUERY_KEY = 'contacts';

export type ContactQueryParams = {
  q?: string;
  page?: number;
  limit?: number;
};

export type UpdateContactInput = {
  id: string;
  body: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    organisationName: string | null;
    subject: string;
    message: string;
    isRead: boolean;
  }>;
};

export type CreateContactInput = Partial<{
  firstName: string;
  lastName: string;
  email: string;
  organisationName: string | null;
  subject: string;
  message: string;
  isRead: boolean;
}>;

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const getErrorMessage = (error: unknown, fallback: string) => {
  const detail = (error as any)?.response?.data;
  return (
    detail?.message ||
    detail?.error ||
    (typeof detail === 'string' ? detail : undefined) ||
    (error as Error)?.message ||
    fallback
  );
};

export function useContacts(params: ContactQueryParams = {}) {
  const q = params.q?.trim() ?? '';
  const page = params.page ?? DEFAULT_PAGE;
  const limit = params.limit ?? DEFAULT_LIMIT;

  return useQuery<ListContactResponse>({
    queryKey: [CONTACTS_QUERY_KEY, q, page, limit],
    queryFn: async () => {
      try {
        return await getContactsAction({
          ...(q ? { q } : {}),
          page,
          limit
        });
      } catch (error: unknown) {
        throw new Error(getErrorMessage(error, 'Failed to fetch contacts'));
      }
    },
    placeholderData: (previousData) => previousData
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation<Contact, Error, CreateContactInput>({
    mutationFn: async (payload) => {
      try {
        return await createContactAction(payload);
      } catch (error: unknown) {
        throw new Error(getErrorMessage(error, 'Failed to create contact'));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONTACTS_QUERY_KEY] });
    }
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation<Contact, Error, UpdateContactInput>({
    mutationFn: async ({ id, body }) => {
      try {
        return await updateContactAction(id, body);
      } catch (error: unknown) {
        throw new Error(getErrorMessage(error, 'Failed to update contact'));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONTACTS_QUERY_KEY] });
    }
  });
}

export function useMarkContactRead() {
  const queryClient = useQueryClient();

  return useMutation<Contact, Error, { id: string; isRead: boolean }>({
    mutationFn: async ({ id, isRead }) => {
      try {
        return await markContactReadAction(id, isRead);
      } catch (error: unknown) {
        throw new Error(getErrorMessage(error, 'Failed to update read status'));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONTACTS_QUERY_KEY] });
    }
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation<{ success: true }, Error, string>({
    mutationFn: async (id) => {
      try {
        return await deleteContactAction(id);
      } catch (error: unknown) {
        throw new Error(getErrorMessage(error, 'Failed to delete contact'));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONTACTS_QUERY_KEY] });
    }
  });
}
