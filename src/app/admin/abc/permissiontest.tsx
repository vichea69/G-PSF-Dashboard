'use client';

import React, { useCallback, useMemo, useState } from 'react';
import PageContainer from '@/components/layout/page-container';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { toast } from 'sonner';

interface Permission {
  viewAny: boolean;
  view: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

interface Permissions {
  logo: Permission;
  category: Permission;
  page: Permission;
  post: Permission;

  [key: string]: Permission;
}

type PermissionKey = keyof Permission;
type SectionKey = keyof Permissions;

interface PermissionConfig {
  key: PermissionKey;
  label: string;
}

interface SectionConfig {
  title: string;
  key: string;
  description?: string;
}

interface PermissionCheckboxProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
}

interface PermissionSectionProps {
  title: string;
  description?: string;
  sectionKey: string;
  permissions: Permission;
  onSelectAll: () => void;
  onPermissionChange: (permission: PermissionKey, value: boolean) => void;
}

const permissionConfigs: PermissionConfig[] = [
  { key: 'view', label: 'View' },
  { key: 'create', label: 'Create' },
  { key: 'update', label: 'Update' },
  { key: 'delete', label: 'Delete' }
];

const createDefaultPermission = (): Permission => ({
  viewAny: false,
  view: false,
  create: false,
  update: false,
  delete: false
});

const PermissionCheckbox: React.FC<PermissionCheckboxProps> = ({
  id,
  checked,
  onCheckedChange,
  label
}) => (
  <div className='border-border/60 bg-card flex items-start gap-3 rounded-lg border px-3 py-3'>
    <Checkbox
      id={id}
      checked={checked}
      onCheckedChange={(state) => onCheckedChange(state === true)}
      className='mt-0.5'
    />
    <Label htmlFor={id} className='text-sm leading-5 font-medium'>
      {label}
    </Label>
  </div>
);

const PermissionSection: React.FC<PermissionSectionProps> = ({
  title,
  description,
  sectionKey,
  permissions,
  onSelectAll,
  onPermissionChange
}) => {
  const allSelected = Object.values(permissions).every(Boolean);

  return (
    <AccordionItem value={sectionKey}>
      <AccordionTrigger className='px-4 text-left text-sm font-semibold sm:px-6'>
        <div className='flex flex-col'>
          <span>{title}</span>
          {description ? (
            <span className='text-muted-foreground text-xs font-normal'>
              {description}
            </span>
          ) : null}
        </div>
      </AccordionTrigger>
      <AccordionContent className='space-y-4 px-4 pt-0 pb-6 sm:px-6'>
        <div className='border-border/60 bg-muted/40 flex flex-col gap-3 rounded-md border border-dashed px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
          <p className='text-muted-foreground text-sm'>
            Adjust the permissions available for this resource.
          </p>
          <Button variant='ghost' size='sm' onClick={onSelectAll}>
            {allSelected ? 'Deselect section' : 'Select section'}
          </Button>
        </div>
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {permissionConfigs.map(({ key, label }) => {
            const checkboxId = `${sectionKey}-${key}`;
            return (
              <PermissionCheckbox
                key={checkboxId}
                id={checkboxId}
                checked={permissions[key]}
                label={label}
                onCheckedChange={(value) => onPermissionChange(key, value)}
              />
            );
          })}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

const RolePermissionManager: React.FC = () => {
  const resourceCount = 154;

  const [roleName, setRoleName] = useState<string>('vichea');
  const [guardName, setGuardName] = useState<string>('admin');
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'logo',
    'category',
    'page',
    'post'
  ]);

  const [permissions, setPermissions] = useState<Permissions>({
    logo: {
      viewAny: false,
      view: false,
      create: true,
      update: false,
      delete: true
    },
    category: createDefaultPermission(),
    page: createDefaultPermission(),
    post: createDefaultPermission()
  });

  const isAllSelected = useMemo(
    () =>
      Object.values(permissions).every((section) =>
        Object.values(section).every(Boolean)
      ),
    [permissions]
  );

  const totalPermissions = useMemo(
    () =>
      Object.values(permissions).reduce(
        (total, section) => total + Object.keys(section).length,
        0
      ),
    [permissions]
  );

  const totalGranted = useMemo(
    () =>
      Object.values(permissions).reduce(
        (total, section) =>
          total + Object.values(section).filter(Boolean).length,
        0
      ),
    [permissions]
  );

  const handlePermissionChange = useCallback(
    (section: SectionKey, permission: PermissionKey, value: boolean) => {
      setPermissions((prev) => {
        const currentSection = prev[section];
        if (!currentSection) {
          return prev;
        }

        return {
          ...prev,
          [section]: {
            ...currentSection,
            [permission]: value
          }
        };
      });
    },
    []
  );

  const handleSelectAll = useCallback((section: SectionKey) => {
    setPermissions((prev) => {
      const currentSection = prev[section];
      if (!currentSection) {
        return prev;
      }

      const shouldEnable = !Object.values(currentSection).every(Boolean);

      const updatedSection = Object.keys(currentSection).reduce((acc, key) => {
        acc[key as PermissionKey] = shouldEnable;
        return acc;
      }, {} as Permission);

      return {
        ...prev,
        [section]: updatedSection
      };
    });
  }, []);

  const handleGlobalSelectAll = useCallback(() => {
    const nextValue = !isAllSelected;

    setPermissions((prev) => {
      const updatedEntries = Object.entries(prev).map(
        ([sectionKey, sectionPermissions]) => {
          const updatedSection = Object.keys(sectionPermissions).reduce(
            (acc, key) => {
              acc[key as PermissionKey] = nextValue;
              return acc;
            },
            {} as Permission
          );

          return [sectionKey, updatedSection] as const;
        }
      );

      return Object.fromEntries(updatedEntries) as Permissions;
    });
  }, [isAllSelected]);

  const handleSave = useCallback(() => {
    toast.success('Role permissions saved');
  }, []);

  const sections: SectionConfig[] = [
    {
      title: 'Logo',
      key: 'logo',
      description: 'Create and manage logo.'
    },
    {
      title: 'Categories',
      key: 'category',
      description: 'Create and publish Category.'
    },
    {
      title: 'Page',
      key: 'page',
      description: 'Create and publish Page.'
    },
    {
      title: 'Post',
      key: 'post',
      description: 'Create and publish Post.'
    }
  ];

  return (
    <PageContainer>
      <div className='flex w-full flex-col gap-6'>
        <Card>
          <CardHeader className='border-b'>
            <CardTitle className='text-xl'>Role details</CardTitle>
            <CardDescription>
              Update the name, guard, and resource permissions for this role.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='grid gap-6 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='role-name'>
                  Name
                  <span className='text-destructive' aria-hidden='true'>
                    *
                  </span>
                </Label>
                <Input
                  id='role-name'
                  value={roleName}
                  onChange={(event) => setRoleName(event.target.value)}
                  placeholder='your_name'
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='guard-name'>Role name</Label>
                <Input
                  id='guard-name'
                  value={guardName}
                  onChange={(event) => setGuardName(event.target.value)}
                  placeholder='Admin'
                />
              </div>
            </div>

            <Separator />

            <div className='border-border/60 bg-muted/30 flex flex-col gap-4 rounded-lg border border-dashed p-4 sm:flex-row sm:items-center sm:justify-between'>
              <div className='space-y-1'>
                <p className='text-sm font-medium'>Resources</p>
                <p className='text-muted-foreground text-sm'>
                  Toggle every permission for this role or adjust per section
                  below.
                </p>
              </div>
              <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4'>
                <div className='flex items-center gap-2'>
                  <Badge variant='secondary' appearance='light'>
                    {resourceCount}
                  </Badge>
                  <span className='text-muted-foreground text-xs'>
                    {totalGranted} of {totalPermissions} permissions active
                  </span>
                </div>
                <Button
                  variant={isAllSelected ? 'secondary' : 'outline'}
                  size='sm'
                  onClick={handleGlobalSelectAll}
                >
                  {isAllSelected ? 'Deselect all' : 'Select all'}
                </Button>
              </div>
            </div>

            <Accordion
              type='multiple'
              value={expandedSections}
              onValueChange={(value) => setExpandedSections(value as string[])}
              className='border-border/60 bg-card/50 rounded-xl border'
            >
              {sections.map(({ title, key, description }) => (
                <PermissionSection
                  key={key}
                  title={title}
                  description={description}
                  sectionKey={key}
                  permissions={permissions[key]}
                  onSelectAll={() => handleSelectAll(key)}
                  onPermissionChange={(permission, value) =>
                    handlePermissionChange(key, permission, value)
                  }
                />
              ))}
            </Accordion>
          </CardContent>
          <CardFooter className='flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-end'>
            <Button variant='outline' size='sm'>
              Cancel
            </Button>
            <Button size='sm' onClick={handleSave}>
              Save changes
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PageContainer>
  );
};

export default RolePermissionManager;
