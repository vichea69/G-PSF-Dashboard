// Types used across the permission feature.
// Keep them simple and well-commented so beginners can follow along.

// Describes the booleans used to toggle each permission option.
export interface Permission {
  viewAny: boolean;
  view: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

// When we need to look up permissions by their key name.
export type PermissionKey = keyof Permission;

// Stores a single section like Logo or Page.
// The key lets us connect the data with UI components.
export interface SectionConfig {
  title: string;
  key: string;
  description?: string;
}

// A shape that can hold the permissions for multiple sections.
export type PermissionState = Record<string, Permission>;
