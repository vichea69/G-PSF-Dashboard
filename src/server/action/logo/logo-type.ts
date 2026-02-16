// Input body we send to backend when creating/updating a logo.
export type LogoPayload = {
  title: string;
  description?: string;
  url: string;
  link?: string;
};

// One logo record we expect from backend.
export type LogoItem = {
  id: number | string;
  title: string;
  url: string;
  description?: string | null;
  link?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

// Standard result shape used by logo server actions.
export type LogoActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};
