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

  async function onSubmit() {
    try {
      // Assuming a function to send reset email
      toast.success('Password reset email sent. Please check your inbox.');
    } catch (error) {
      toast.error('Failed to send password reset email. Please try again.');
    }
  }

  const submitting = form.formState.isSubmitting;

  return (
    <div className='flex min-h-screen w-full items-center justify-center px-4 py-8'>
      <Card className='mx-auto w-full max-w-sm sm:max-w-md'>
        <CardHeader className='space-y-3 text-center'>
          <div className='bg-primary/10 text-primary mx-auto flex h-12 w-12 items-center justify-center rounded-full'>
            <Mail className='h-5 w-5' />
          </div>
          <CardTitle className='text-xl sm:text-2xl'>Forgot Password</CardTitle>
          <CardDescription className='text-muted-foreground text-sm'>
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
                      <FormLabel htmlFor='email'>Email</FormLabel>
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
                    className='text-primary font-medium hover:underline'
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
