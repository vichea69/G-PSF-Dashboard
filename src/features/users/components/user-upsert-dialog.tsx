'use client';
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

const baseSchema = z.object({
  username: z.string().trim().min(1, 'username should not be empty'),
  email: z
    .string()
    .trim()
    .min(1, 'email should not be empty')
    .email('email must be an email'),
  role: z
    .enum(['admin', 'editor', 'user'], {
      required_error:
        'role must be one of the following values: admin, editor, user',
      invalid_type_error:
        'role must be one of the following values: admin, editor, user'
    })
    .default('user'),
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
  const form = useForm<FormValues>({
    resolver: zodResolver(mode === 'create' ? createSchema : editSchema),
    defaultValues: {
      username: initialData?.username ?? '',
      email: initialData?.email ?? '',
      role: (initialData?.role as any) ?? 'user',
      bio: initialData?.bio ?? '',
      image: initialData?.image ?? '',
      password: ''
    }
  });

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
      const base = {
        id: initialData?.id!,
        username: payload.username,
        email: payload.email,
        role: payload.role
      } as const;
      // Extend only if backend supports extra fields in update
      const body = {
        ...base,
        ...(payload.bio ? { bio: payload.bio } : {}),
        ...(payload.image ? { image: payload.image } : {})
      } as any;
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
                  <FormLabel>Image URL (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type='url'
                      placeholder='https://example.com/avatar.png'
                      {...field}
                    />
                  </FormControl>
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
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='Select role' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='user'>User</SelectItem>
                        <SelectItem value='editor'>Editor</SelectItem>
                        <SelectItem value='admin'>Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
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
      </DialogContent>
    </Dialog>
  );
}
