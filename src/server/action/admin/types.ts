// API entity returned from backend
export type AdminUser = {
  id: string | number;
  username: string;
  email: string;
  role: string;
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
  role: string;
};

// Update payload per backend contract
export type AdminUserUpdate = {
  id: string | number;
  username?: string;
  email?: string;
  role?: string;
  // include password if your backend supports updating it
  password?: string;
  bio?: string | null;
  image?: string | null;
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

export type UpdateRolePermissions = {
  permissions: RolePermissionInput[];
};

export type UpdateRoleInfo = {
  name: string;
  description: string;
};
