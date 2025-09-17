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

import { resetPasswordSchema } from '@/lib/validation-schemas';

const formSchema = resetPasswordSchema;

export default function ResetPassword() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Assuming an async reset password function
      toast.success(
        'Password reset successful. You can now log in with your new password.'
      );
    } catch (error) {
      toast.error('Failed to reset the password. Please try again.');
    }
  }

  const submitting = form.formState.isSubmitting;

  return (
    <div className='flex min-h-screen w-full items-center justify-center px-4 py-8'>
      <Card className='mx-auto w-full max-w-sm sm:max-w-md'>
        <CardHeader className='text-center'>
          <CardTitle className='text-xl sm:text-2xl'>Reset Password</CardTitle>
          <CardDescription className='text-sm sm:text-base'>
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
                      <FormLabel htmlFor='password'>New Password</FormLabel>
                      <FormControl>
                        <Input
                          id='password'
                          type='password'
                          placeholder='••••••••'
                          autoComplete='new-password'
                          {...field}
                        />
                      </FormControl>
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
                      <FormLabel htmlFor='confirmPassword'>
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          id='confirmPassword'
                          type='password'
                          placeholder='••••••••'
                          autoComplete='new-password'
                          {...field}
                        />
                      </FormControl>
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
