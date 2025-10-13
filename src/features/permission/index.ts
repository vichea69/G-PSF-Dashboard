// Central exports so pages can pull the feature with short imports.
export { PermissionManager } from '@/features/permission/components/PermissionManager';
export {
  sections,
  createDefaultPermission
} from '@/features/permission/data/permissionData';
export { usePermission } from '@/features/permission/hook/usePermission';
