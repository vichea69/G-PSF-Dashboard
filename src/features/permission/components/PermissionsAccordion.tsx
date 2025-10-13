import React from 'react';

import { Accordion } from '@/components/ui/accordion';

import { PermissionSection } from '@/features/permission/components/PermissionSection';
import {
  type PermissionState,
  type SectionConfig,
  type PermissionKey
} from '@/features/permission/type/permissionType';

interface PermissionsAccordionProps {
  sections: SectionConfig[];
  permissions: PermissionState;
  expandedSections: string[];
  onExpandedChange: (expanded: string[]) => void;
  onPermissionChange: (
    sectionKey: string,
    permissionKey: PermissionKey,
    value: boolean
  ) => void;
  onSelectSection: (sectionKey: string) => void;
}

// Wraps the accordion element so the page component stays short.
export const PermissionsAccordion: React.FC<PermissionsAccordionProps> = ({
  sections,
  permissions,
  expandedSections,
  onExpandedChange,
  onPermissionChange,
  onSelectSection
}) => {
  return (
    <Accordion
      type='multiple'
      value={expandedSections}
      // Library gives us an array of strings, so we forward it to the parent.
      onValueChange={(value) => onExpandedChange(value as string[])}
      className='border-border/60 bg-card/50 rounded-xl border'
    >
      {sections.map(({ title, key, description }) => (
        <PermissionSection
          key={key}
          title={title}
          description={description}
          sectionKey={key}
          permissions={permissions[key]}
          onSelectAll={() => onSelectSection(key)}
          onPermissionChange={(permissionKey, value) =>
            onPermissionChange(key, permissionKey, value)
          }
        />
      ))}
    </Accordion>
  );
};
