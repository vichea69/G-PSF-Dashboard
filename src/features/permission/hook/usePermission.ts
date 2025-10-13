'use client';
import { useCallback, useState } from 'react';
import {
  type PermissionKey,
  type PermissionState
} from '@/features/permission/type/permissionType';
import { createDefaultPermission } from '@/features/permission/data/permissionData';

// Small helper to build default permissions for every section.
const buildDefaultPermissions = (sectionKeys: string[]): PermissionState => {
  return sectionKeys.reduce<PermissionState>((acc, key) => {
    acc[key] = createDefaultPermission();
    return acc;
  }, {});
};

// Hook that wraps the permission logic so components stay easy to read.
export const usePermission = (
  sectionKeys: string[],
  initialState?: PermissionState
) => {
  // State that tracks the current permissions per section.
  const [permissions, setPermissions] = useState<PermissionState>(() => {
    if (initialState) {
      return initialState;
    }

    return buildDefaultPermissions(sectionKeys);
  });

  // Check if every toggle is active.
  const isAllSelected = Object.values(permissions).every((section) => {
    return Object.values(section).every(Boolean);
  });

  // Count all available toggles.
  const totalPermissions = Object.values(permissions).reduce(
    (total, section) => {
      return total + Object.keys(section).length;
    },
    0
  );

  // Count the toggles that are turned on.
  const totalGranted = Object.values(permissions).reduce((total, section) => {
    const grantedCount = Object.values(section).filter(Boolean).length;
    return total + grantedCount;
  }, 0);

  // Update a single permission like "view" for a given section.
  const handlePermissionChange = useCallback(
    (sectionKey: string, permissionKey: PermissionKey, value: boolean) => {
      setPermissions((prev) => {
        const currentSection = prev[sectionKey];
        if (!currentSection) {
          return prev;
        }

        return {
          ...prev,
          [sectionKey]: {
            ...currentSection,
            [permissionKey]: value
          }
        };
      });
    },
    []
  );

  // Toggle every permission inside one section (Logo, Page, etc.).
  const handleSelectAll = useCallback((sectionKey: string) => {
    setPermissions((prev) => {
      const section = prev[sectionKey];
      if (!section) {
        return prev;
      }

      const shouldEnable = !Object.values(section).every(Boolean);

      const updatedSection = { ...section };
      Object.keys(updatedSection).forEach((key) => {
        updatedSection[key as PermissionKey] = shouldEnable;
      });

      return {
        ...prev,
        [sectionKey]: updatedSection
      };
    });
  }, []);

  // Toggle every permission across every section at once.
  const handleGlobalSelectAll = useCallback(() => {
    const nextValue = !isAllSelected;

    setPermissions((prev) => {
      const updatedState: PermissionState = {};

      Object.entries(prev).forEach(([sectionKey, sectionPermissions]) => {
        const updatedSection = { ...sectionPermissions };
        Object.keys(updatedSection).forEach((key) => {
          updatedSection[key as PermissionKey] = nextValue;
        });

        updatedState[sectionKey] = updatedSection;
      });

      return updatedState;
    });
  }, [isAllSelected]);

  return {
    permissions,
    isAllSelected,
    totalPermissions,
    totalGranted,
    handlePermissionChange,
    handleSelectAll,
    handleGlobalSelectAll
  };
};
