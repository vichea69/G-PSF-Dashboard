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
import { useTranslate } from '@/hooks/use-translate';

type FormValues = {
  username: string;
  email: string;
  role: string;
  bio?: string;
  image?: string;
  password?: string;
};

type TranslateFn = (key: string) => string;

function buildEditSchema(t: TranslateFn) {
  return z.object({
    username: z
      .string()
      .trim()
      .min(1, t('user.form.validation.usernameRequired')),
    email: z
      .string()
      .trim()
      .min(1, t('user.form.validation.emailRequired'))
      .email(t('user.form.validation.emailInvalid')),
    role: z.string().trim().min(1, t('user.form.validation.roleRequired')),
    bio: z.string().optional(),
    image: z.string().optional(),
    password: z.string().optional()
  });
}

function buildCreateSchema(t: TranslateFn) {
  return buildEditSchema(t).extend({
    password: z
      .string({ required_error: t('user.form.validation.passwordRequired') })
      .trim()
      .min(1, t('user.form.validation.passwordRequired'))
  });
}

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
  const { t } = useTranslate();
  const rolesQuery = useRole({ enabled: open });
  const roles = useMemo(() => rolesQuery.data ?? [], [rolesQuery.data]);
  const resolvedInitialRole = useMemo(
    () => resolveRoleValue(initialData?.role, roles),
    [initialData?.role, roles]
  );
  // Build schema inside the component so validation messages follow the active language.
  const schema = useMemo(
    () => (mode === 'create' ? buildCreateSchema(t) : buildEditSchema(t)),
    [mode, t]
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
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
    if (!open) {
      return;
    }

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
    open,
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
      toast.success(t('user.toast.created'));
      onOpenChange(false);
    },
    onError: (e: any) => {
      const msg =
        e?.response?.data?.message ??
        e?.message ??
        t('user.toast.createFailed');
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
      toast.success(t('user.toast.updated'));
      onOpenChange(false);
    },
    onError: (e: any) => {
      const msg =
        e?.response?.data?.message ??
        e?.message ??
        t('user.toast.updateFailed');
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
      toast.error(t('user.toast.selectedMediaInvalid'));
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
            {mode === 'create' ? t('user.createTitle') : t('user.editTitle')}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? t('user.createDescription')
              : t('user.editDescription')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='username'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('user.form.username')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('user.form.usernamePlaceholder')}
                      {...field}
                    />
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
                    <FormLabel>{t('user.form.password')}</FormLabel>
                    <FormControl>
                      <Input
                        type='password'
                        placeholder={t('user.form.passwordPlaceholder')}
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
                  <FormLabel>{t('user.form.email')}</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder={t('user.form.emailPlaceholder')}
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
                  <FormLabel>{t('user.form.bioOptional')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('user.form.bioPlaceholder')}
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
                    <FormLabel>{t('user.form.imageOptional')}</FormLabel>
                    <div className='flex items-center gap-2'>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => setImagePickerOpen(true)}
                        disabled={loading}
                      >
                        {t('user.form.selectFromMedia')}
                      </Button>
                      {field.value ? (
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() => field.onChange('')}
                          disabled={loading}
                        >
                          {t('user.form.clear')}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  {field.value ? (
                    <div className='bg-muted/30 mt-2 flex items-center gap-3 rounded-md border p-3'>
                      <div className='relative h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-white'>
                        <Image
                          src={resolveApiAssetUrl(field.value)}
                          alt={t('user.form.imagePreviewAlt')}
                          fill
                          unoptimized
                          className='object-cover'
                        />
                      </div>
                    </div>
                  ) : (
                    <div className='text-muted-foreground mt-2 rounded-md border border-dashed p-3 text-sm'>
                      {t('user.form.noImageSelected')}
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
                  <FormLabel>{t('user.form.role')}</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                      disabled={loading || rolesQuery.isLoading}
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder={t('user.form.selectRole')} />
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
                      {t('user.form.rolesLoadFailed')}
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
                {t('user.form.cancel')}
              </Button>
              <Button type='submit' disabled={loading}>
                {mode === 'create'
                  ? t('user.form.createSubmit')
                  : t('user.form.saveChanges')}
              </Button>
            </div>
          </form>
        </Form>

        <FileModal
          isOpen={imagePickerOpen}
          onClose={() => setImagePickerOpen(false)}
          onSelect={handleSelectImageFromMedia}
          allowUploadFromDevice={false}
          title={t('user.form.selectUserImage')}
          description={t('user.form.mediaDescription')}
          types={['image']}
          accept='image/*'
        />
      </DialogContent>
    </Dialog>
  );
}
