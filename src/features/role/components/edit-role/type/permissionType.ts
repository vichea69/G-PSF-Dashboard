export interface Permission {
  viewAny: boolean;
  view: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

export type PermissionKey = keyof Permission;

export interface SectionConfig {
  title: string;
  key: string;
  description?: string;
}

export type PermissionState = Record<string, Permission>;
