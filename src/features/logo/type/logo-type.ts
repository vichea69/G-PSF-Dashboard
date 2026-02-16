export type LogoType = {
  id: number;
  url: string;
  title: string;
  // Optional fields from backend response.
  description?: string | null;
  link?: string | null;
  createdAt: string;
  updatedAt: string;
};
