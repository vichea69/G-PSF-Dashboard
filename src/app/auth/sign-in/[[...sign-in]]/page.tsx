'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Shield, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/server/action/userAuth/user';

export default function AdminLogin() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const res = await loginAction({ email, password });
      // Mirror current user client-side for UI that reads from localStorage
      try {
        const user = res?.user;
        if (user) {
          localStorage.setItem('current_user', JSON.stringify(user));
          window.dispatchEvent(new Event('auth:user'));
        }
      } catch {}
      router.replace('/dashboard/overview');
    } catch (error: any) {
      // Login error
      setErr(
        error?.response?.data?.message ??
          'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 dark:from-slate-950 dark:via-slate-900 dark:to-zinc-950'>
      {/* Background decoration */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute -top-1/2 -right-1/2 h-full w-full rounded-full bg-gradient-to-br from-blue-400/20 to-purple-600/20 blur-3xl dark:from-blue-400/10 dark:to-purple-600/10'></div>
        <div className='absolute -bottom-1/2 -left-1/2 h-full w-full rounded-full bg-gradient-to-tr from-indigo-400/20 to-pink-600/20 blur-3xl dark:from-indigo-400/10 dark:to-pink-600/10'></div>
      </div>

      <Card className='relative mx-auto w-full max-w-md border-0 bg-white/95 shadow-2xl backdrop-blur-sm dark:bg-zinc-900/90'>
        <CardHeader className='space-y-4 pb-6'>
          {/* Logo */}
          <div className='flex justify-center'>
            <div className='relative'>
              <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg'>
                <Shield className='h-8 w-8 text-white' />
              </div>
              <div className='absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500'>
                <div className='h-2 w-2 rounded-full bg-white'></div>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className='space-y-2 text-center'>
            <CardTitle className='bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-2xl font-bold text-transparent dark:from-gray-100 dark:to-gray-400'>
              Admin Dashboard
            </CardTitle>
            <CardDescription className='text-base text-gray-600 dark:text-gray-300'>
              Sign in to access your admin panel
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className='space-y-6'>
          {/* Error Alert */}
          {err && (
            <Alert
              variant='destructive'
              className='border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30'
            >
              <AlertDescription className='text-red-800 dark:text-red-300'>
                {err}
              </AlertDescription>
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={onSubmit} className='space-y-5'>
            {/* Email Field */}
            <div className='space-y-2'>
              <Label
                htmlFor='email'
                className='text-sm font-medium text-gray-700 dark:text-gray-300'
              >
                Email Address
              </Label>
              <div className='relative'>
                <Mail className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400 dark:text-gray-500' />
                <Input
                  id='email'
                  name='email'
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='h-12 border-gray-200 pl-10 transition-colors focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:focus:border-blue-500 dark:focus:ring-blue-500'
                  placeholder='admin@example.com'
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className='space-y-2'>
              <Label
                htmlFor='password'
                className='text-sm font-medium text-gray-700 dark:text-gray-300'
              >
                Password
              </Label>
              <div className='relative'>
                <Lock className='absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400 dark:text-gray-500' />
                <Input
                  id='password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='h-12 border-gray-200 pr-12 pl-10 transition-colors focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:focus:border-blue-500 dark:focus:ring-blue-500'
                  placeholder='Enter your password'
                  required
                />
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 transform p-0 hover:bg-gray-100 dark:hover:bg-gray-800'
                >
                  {showPassword ? (
                    <EyeOff className='h-4 w-4 text-gray-500' />
                  ) : (
                    <Eye className='h-4 w-4 text-gray-500' />
                  )}
                </Button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className='flex items-center justify-between text-sm'>
              <label className='flex cursor-pointer items-center space-x-2'>
                <input
                  type='checkbox'
                  className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                />
                <span className='text-gray-600 dark:text-gray-300'>
                  Remember me
                </span>
              </label>
              <button
                type='button'
                className='font-medium text-blue-600 hover:text-blue-700 hover:underline'
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type='submit'
              disabled={loading}
              className='h-12 w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 font-medium text-white shadow-lg transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50'
            >
              {loading ? (
                <div className='flex items-center space-x-2'>
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
