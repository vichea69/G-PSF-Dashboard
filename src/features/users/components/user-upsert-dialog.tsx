'use client';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAdminUser, updateAdminUser } from '@/server/action/admin/admin';
import { toast } from 'sonner';
import type { UserRow } from './user-tables/columns';
import { FileModal } from '@/components/modal/file-modal';
import type { MediaFile } from '@/features/media/types/media-type';
import { resolveApiAssetUrl, toApiAssetPath } from '@/lib/asset-url';
import { useRole } from '@/features/role/hook/use-role';
import type { RoleAPI } from '@/features/role/type/role';

const baseSchema = z.object({
  username: z.string().trim().min(1, 'username should not be empty'),
  email: z
    .string()
    .trim()
    .min(1, 'email should not be empty')
    .email('email must be an email'),
  role: z.string().trim().min(1, 'role should not be empty'),
  bio: z.string().optional(),
  image: z.string().optional(),
  password: z.string().optional()
});

const createSchema = baseSchema.extend({
  password: z
    .string({ required_error: 'password should not be empty' })
    .trim()
    .min(1, 'password should not be empty')
});

const editSchema = baseSchema; // password optional when editing

type FormValues = z.infer<typeof baseSchema>;

function getRoleOptionValue(role: RoleAPI) {
  return role.slug?.trim() || String(role.id);
}

function normalizeValue(value: unknown) {
  return String(value ?? '')
    .trim()
    .toLowerCase();
}

function resolveRoleValue(value: unknown, roles: RoleAPI[]) {
  const normalizedValue = normalizeValue(value);

  if (!normalizedValue) {
    return '';
  }

  const matchedRole = roles.find((role) => {
    return [role.slug, role.name, role.id]
      .map(normalizeValue)
      .includes(normalizedValue);
  });

  return matchedRole
    ? getRoleOptionValue(matchedRole)
    : String(value ?? '').trim();
}

export function UserUpsertDialog({
  mode,
  open,
  onOpenChange,
  initialData
}: {
  mode: 'create' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<UserRow>;
}) {
  const qc = useQueryClient();
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const rolesQuery = useRole();
  const roles = useMemo(() => rolesQuery.data ?? [], [rolesQuery.data]);
  const resolvedInitialRole = useMemo(
    () => resolveRoleValue(initialData?.role, roles),
    [initialData?.role, roles]
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(mode === 'create' ? createSchema : editSchema),
    defaultValues: {
      username: initialData?.username ?? '',
      email: initialData?.email ?? '',
      role: resolvedInitialRole,
      bio: initialData?.bio ?? '',
      image: initialData?.image ?? '',
      password: ''
    }
  });

  useEffect(() => {
    form.reset({
      username: initialData?.username ?? '',
      email: initialData?.email ?? '',
      role: resolvedInitialRole,
      bio: initialData?.bio ?? '',
      image: initialData?.image ?? '',
      password: ''
    });
  }, [
    form,
    initialData?.bio,
    initialData?.email,
    initialData?.id,
    initialData?.image,
    initialData?.username,
    resolvedInitialRole
  ]);

  const createMutation = useMutation({
    mutationFn: async (payload: FormValues) => {
      const base = {
        username: payload.username,
        email: payload.email,
        role: payload.role,
        password: payload.password!
      } as const;
      // Extend only if backend supports extra fields in create
      const body = {
        ...base,
        ...(payload.bio ? { bio: payload.bio } : {}),
        ...(payload.image ? { image: payload.image } : {})
      } as any;
      return await createAdminUser(body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created');
      onOpenChange(false);
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.message ?? e?.message ?? 'Create failed';
      toast.error(msg);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: FormValues) => {
      const userPayload = {
        id: initialData?.id!,
        username: payload.username,
        email: payload.email,
        role: payload.role
      } as const;
      const body = {
        ...userPayload,
        bio: payload.bio?.trim() || null,
        image: payload.image?.trim() || null
      };

      return await updateAdminUser(body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated');
      onOpenChange(false);
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.message ?? e?.message ?? 'Update failed';
      toast.error(msg);
    }
  });

  const onSubmit = (values: FormValues) => {
    if (mode === 'create') return createMutation.mutate(values);
    return updateMutation.mutate(values);
  };

  const handleSelectImageFromMedia = (file: MediaFile) => {
    const selectedUrl = (file.url ?? file.thumbnail ?? '').trim();
    if (!selectedUrl) {
      toast.error('Selected media does not have a valid image URL');
      return;
    }

    form.setValue('image', toApiAssetPath(selectedUrl), {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true
    });
  };

  const loading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create User' : 'Edit User'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new user to your workspace.'
              : 'Update the selected user.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='username'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder='johndoe' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {mode === 'create' && (
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type='password'
                        placeholder='********'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='john@example.com'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='bio'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Short bio...'
                      className='resize-none'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='image'
              render={({ field }) => (
                <FormItem>
                  <div className='flex items-center justify-between gap-2'>
                    <FormLabel>Image (optional)</FormLabel>
                    <div className='flex items-center gap-2'>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => setImagePickerOpen(true)}
                        disabled={loading}
                      >
                        Select from Media
                      </Button>
                      {field.value ? (
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() => field.onChange('')}
                          disabled={loading}
                        >
                          Clear
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  {field.value ? (
                    <div className='bg-muted/30 mt-2 flex items-center gap-3 rounded-md border p-3'>
                      <div className='relative h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-white'>
                        <Image
                          src={resolveApiAssetUrl(field.value)}
                          alt='User image preview'
                          fill
                          unoptimized
                          className='object-cover'
                        />
                      </div>
                    </div>
                  ) : (
                    <div className='text-muted-foreground mt-2 rounded-md border border-dashed p-3 text-sm'>
                      No image selected.
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='role'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                      disabled={loading || rolesQuery.isLoading}
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select role' />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem
                            key={role.id}
                            value={getRoleOptionValue(role)}
                          >
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  {rolesQuery.isError ? (
                    <p className='text-destructive text-sm'>
                      Failed to load roles.
                    </p>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Bio and Image fields are intentionally hidden to match backend schema */}

            <div className='flex justify-end gap-2 pt-2'>
              <Button
                type='button'
                variant='ghost'
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={loading}>
                {mode === 'create' ? 'Create' : 'Save changes'}
              </Button>
            </div>
          </form>
        </Form>

        <FileModal
          isOpen={imagePickerOpen}
          onClose={() => setImagePickerOpen(false)}
          onSelect={handleSelectImageFromMedia}
          allowUploadFromDevice={false}
          title='Select user image'
          description='Select an image from Media Manager.'
          types={['image']}
          accept='image/*'
        />
      </DialogContent>
    </Dialog>
  );
}
