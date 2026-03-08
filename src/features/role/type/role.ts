export interface RoleAPI {
  id: number;
  slug: string;
  name: string;
  description: string;
  isSystem: boolean;
  isActive: boolean;
  permissionsCount: number;
  resourcesCount: number;
  createdAt: string;
  updatedAt: string;
}
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  version: string;
}

export type RoleResourceAction = {
  action: string;
  label: string;
};

export type RolePermissionInput = {
  resource: string;
  actions: string[];
};

export type RoleResourceDefinition = {
  resource: string;
  label: string;
  description?: string | null;
  actions: RoleResourceAction[];
};

export type RoleMatrixToggle = {
  action: string;
  label: string;
  enabled: boolean;
};

export type RoleMatrixItem = {
  resource: string;
  label: string;
  description?: string | null;
  toggles: RoleMatrixToggle[];
};

export type RoleDetailStats = {
  selected: number;
  total: number;
};

export type RoleDetailData = {
  role: RoleAPI;
  matrix: RoleMatrixItem[];
  stats?: RoleDetailStats | null;
};
