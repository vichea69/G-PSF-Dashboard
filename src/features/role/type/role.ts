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
