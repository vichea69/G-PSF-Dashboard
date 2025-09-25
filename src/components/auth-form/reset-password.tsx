'use client';

import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';

import { useRouter, useSearchParams } from 'next/navigation';
import { resetPasswordSchema } from '@/lib/validation-schemas';
import { resetPassword as resetPasswordAction } from '@/server/action/userAuth/user';

const formSchema = resetPasswordSchema;

type ResetPasswordProps = {
  token?: string;
};

export default function ResetPassword({ token }: ResetPasswordProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const fallbackToken = searchParams.get('token') ?? '';
      const activeToken = token?.trim() || fallbackToken.trim();

      if (!activeToken) {
        toast.error(
          'Reset token is missing or invalid. Please request a new link.'
        );
        return;
      }

      const result = await resetPasswordAction({
        token: activeToken,
        password: values.password
      });

      if (!result?.success) {
        const message =
          result?.error ?? 'Failed to reset the password. Please try again.';
        form.setError('password', { message });
        toast.error(message);
        return;
      }

      toast.success(
        'Password reset successful. You can now log in with your new password.'
      );
      form.reset({ password: '', confirmPassword: '' });
      router.push('/auth/sign-in');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to reset the password. Please try again.';
      toast.error(message);
    }
  }

  const submitting = form.formState.isSubmitting;

  return (
    <div className='relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-white to-slate-200 px-4 py-8 dark:from-slate-950 dark:via-slate-900 dark:to-zinc-950'>
      <div className='pointer-events-none absolute inset-0 -z-10 overflow-hidden'>
        <div className='bg-primary/25 dark:bg-primary/15 absolute -top-24 right-1/2 h-64 w-64 translate-x-1/2 rounded-full opacity-70 blur-3xl'></div>
        <div className='absolute -bottom-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-300/30 opacity-60 blur-3xl dark:bg-indigo-500/10'></div>
      </div>
      <Card className='border-border/60 dark:border-border/40 relative mx-auto w-full max-w-sm border shadow-xl backdrop-blur-sm sm:max-w-md'>
        <CardHeader className='space-y-3 text-center'>
          <CardTitle className='bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-xl font-semibold text-transparent sm:text-2xl dark:from-slate-100 dark:to-slate-300'>
            Reset Password
          </CardTitle>
          <CardDescription className='text-muted-foreground dark:text-muted-foreground text-sm sm:text-base'>
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-6 sm:space-y-8'
            >
              <div className='grid gap-4'>
                {/* New Password Field */}
                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem className='grid gap-2'>
                      <FormLabel htmlFor='password' className='text-foreground'>
                        New Password
                      </FormLabel>
                      <div className='relative'>
                        <FormControl>
                          <Input
                            id='password'
                            type={showPassword ? 'text' : 'password'}
                            placeholder='••••••••'
                            autoComplete='new-password'
                            className='pr-12'
                            {...field}
                          />
                        </FormControl>
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() => setShowPassword((prev) => !prev)}
                          className='hover:bg-muted dark:hover:bg-muted/50 absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 transform p-0'
                        >
                          {showPassword ? (
                            <EyeOff className='text-muted-foreground h-4 w-4' />
                          ) : (
                            <Eye className='text-muted-foreground h-4 w-4' />
                          )}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Confirm Password Field */}
                <FormField
                  control={form.control}
                  name='confirmPassword'
                  render={({ field }) => (
                    <FormItem className='grid gap-2'>
                      <FormLabel
                        htmlFor='confirmPassword'
                        className='text-foreground'
                      >
                        Confirm Password
                      </FormLabel>
                      <div className='relative'>
                        <FormControl>
                          <Input
                            id='confirmPassword'
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder='••••••••'
                            autoComplete='new-password'
                            className='pr-12'
                            {...field}
                          />
                        </FormControl>
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() =>
                            setShowConfirmPassword((prev) => !prev)
                          }
                          className='hover:bg-muted dark:hover:bg-muted/50 absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 transform p-0'
                        >
                          {showConfirmPassword ? (
                            <EyeOff className='text-muted-foreground h-4 w-4' />
                          ) : (
                            <Eye className='text-muted-foreground h-4 w-4' />
                          )}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type='submit' className='w-full' disabled={submitting}>
                  {submitting ? 'Resetting…' : 'Reset Password'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
