'use client';
import { useCallback, useState } from 'react';

import {
  type PermissionKey,
  type PermissionState
} from '../type/permissionType';
import { createDefaultPermission } from '../data/permissionData';

const buildDefaultPermissions = (sectionKeys: string[]): PermissionState => {
  return sectionKeys.reduce<PermissionState>((acc, key) => {
    acc[key] = createDefaultPermission();
    return acc;
  }, {});
};

export const usePermission = (
  sectionKeys: string[],
  initialState?: PermissionState
) => {
  const [permissions, setPermissions] = useState<PermissionState>(() => {
    if (initialState) {
      return initialState;
    }

    return buildDefaultPermissions(sectionKeys);
  });

  const isAllSelected = Object.values(permissions).every((section) => {
    return Object.values(section).every(Boolean);
  });

  const totalPermissions = Object.values(permissions).reduce(
    (total, section) => {
      return total + Object.keys(section).length;
    },
    0
  );

  const totalGranted = Object.values(permissions).reduce((total, section) => {
    const grantedCount = Object.values(section).filter(Boolean).length;
    return total + grantedCount;
  }, 0);

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
