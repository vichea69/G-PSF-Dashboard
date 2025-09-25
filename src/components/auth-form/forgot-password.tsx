'use client';
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
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { emailSchema } from '@/lib/validation-schemas';
import { forgotPassword } from '@/server/action/userAuth/user';

// Schema for email validation
const formSchema = z.object({
  email: emailSchema
});

export default function ForgetPassword() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: ''
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const email = values.email.trim();
      const result = await forgotPassword({ email });

      if (!result?.success) {
        const message =
          result?.error ??
          'Failed to send password reset email. Please try again.';
        toast.error(message);
        return;
      }
      toast.success('Password reset email sent. Please check your inbox.');
      form.reset({ email: '' });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to send password reset email. Please try again.';
      toast.error(message);
    }
  }

  const submitting = form.formState.isSubmitting;

  return (
    <div className='relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-white to-slate-200 px-4 py-8 dark:from-slate-950 dark:via-slate-900 dark:to-zinc-950'>
      <div className='pointer-events-none absolute inset-0 -z-10 overflow-hidden'>
        <div className='bg-primary/25 dark:bg-primary/15 absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full opacity-70 blur-3xl'></div>
        <div className='absolute right-1/2 -bottom-32 h-72 w-72 translate-x-1/2 rounded-full bg-indigo-300/30 opacity-60 blur-3xl dark:bg-indigo-500/10'></div>
      </div>
      <Card className='border-border/60 dark:border-border/40 relative mx-auto w-full max-w-sm border shadow-xl backdrop-blur-sm sm:max-w-md'>
        <CardHeader className='space-y-3 text-center'>
          <div className='bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary-foreground mx-auto flex h-12 w-12 items-center justify-center rounded-full'>
            <Mail className='h-5 w-5' />
          </div>
          <CardTitle className='bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-xl font-semibold text-transparent sm:text-2xl dark:from-slate-100 dark:to-slate-300'>
            Forgot Password
          </CardTitle>
          <CardDescription className='text-muted-foreground dark:text-muted-foreground text-sm'>
            Enter your email address to receive a password reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-6 sm:space-y-8'
            >
              <div className='grid gap-4'>
                {/* Email Field */}
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem className='grid gap-2'>
                      <FormLabel htmlFor='email' className='text-foreground'>
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          id='email'
                          placeholder='johndoe@mail.com'
                          type='email'
                          autoComplete='email'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type='submit' className='w-full' disabled={submitting}>
                  {submitting ? 'Sending…' : 'Send Reset Link'}
                </Button>
                <p className='text-muted-foreground text-center text-xs'>
                  Remember your password?{' '}
                  <Link
                    className='text-primary dark:text-primary font-medium hover:underline'
                    href='/auth/sign-in'
                  >
                    Back to sign in
                  </Link>
                </p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
