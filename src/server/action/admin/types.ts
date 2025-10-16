// API entity returned from backend
export type AdminUser = {
  id: string | number;
  username: string;
  email: string;
  role: 'admin' | 'editor' | 'user';
  bio?: string | null;
  image?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

// Create payload per backend contract
export type AdminUserCreate = {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'editor' | 'user';
};

// Update payload per backend contract
export type AdminUserUpdate = {
  id: string | number;
  username?: string;
  email?: string;
  role?: 'admin' | 'editor' | 'user';
  // include password if your backend supports updating it
  password?: string;
};

export type RolePermissionInput = {
  resource: string;
  actions: string[];
};

export type CreateRole = {
  name: string;
  description: string;
  permissions: RolePermissionInput[];
};
