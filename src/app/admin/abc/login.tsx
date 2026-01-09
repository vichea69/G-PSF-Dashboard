'use client';
import { useState } from 'react';
import Link from 'next/link';
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login triggered');
  };
  return (
    <div className='flex min-h-screen w-full flex-col bg-gradient-to-br from-[#4ab1be] to-[#1fc3a2] lg:flex-row'>
      <div className='relative hidden flex-col items-center justify-center p-8 sm:p-12 lg:flex lg:w-1/2 lg:p-20'>
        <div className='absolute bottom-0 left-0 h-64 w-64 -translate-x-1/3 translate-y-1/3 rounded-full border-[40px] border-white/10' />
        <div className='absolute top-10 right-10 h-32 w-32 rounded-full border-[20px] border-white/5' />
        <div className='relative z-10 flex max-w-lg flex-col gap-8 text-white'>
          <div>
            <p className='mb-2 text-lg font-medium opacity-90'>Welcome!</p>
            <h1 className='mb-6 text-4xl leading-tight font-bold lg:text-5xl'>
              Government–Private Sector Forum
            </h1>
            <p className='text-lg leading-relaxed text-white/90'>
              The Royal Government of Cambodia considers the private sector as a
              key partner and engine of national economic growth.
            </p>
          </div>

          <div className='flex justify-center lg:justify-start'>
            <img
              src='/assets/undraw_online-community_3o0l 1.svg'
              alt='Online community illustration'
              className='w-full max-w-xs drop-shadow-2xl sm:max-w-sm lg:max-w-md'
            />
          </div>
        </div>
      </div>

      <div className='flex flex-1 items-center justify-center p-6 sm:p-12'>
        <div className='h-[700px] w-full max-w-[700px] rounded-3xl rounded-xl border border-white/20 bg-white p-8 shadow-2xl backdrop-blur-md lg:p-12'>
          <div className='mb-8 flex justify-center'>
            <img
              src='/assets/gpsf_logo.png'
              alt='Cambodia G-PSF Logo'
              className='h-20'
            />
          </div>

          <h2 className='mb-10 text-center text-xl font-medium text-[#717680]'>
            Sign in to your account
          </h2>

          <form className='space-y-6' onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor='email'
                className='mb-2 block text-sm font-semibold text-[#414651]'
              >
                Email Address
              </label>
              <input
                type='email'
                id='email'
                required
                placeholder='privatesectoruser@gmail.com'
                className='w-full rounded-xl border border-[#e6e6e6] px-4 py-3 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[#4ab1be]'
              />
            </div>
            <div className='relative'>
              <label
                htmlFor='password'
                className='mb-2 block text-sm font-semibold text-[#414651]'
              >
                Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                id='password'
                required
                placeholder='••••••••'
                className='w-full rounded-xl border border-[#e6e6e6] px-4 py-3 transition-all outline-none focus:border-transparent focus:ring-2 focus:ring-[#4ab1be]'
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute top-[38px] right-4 text-xs font-bold text-[#4ab1be] transition-colors hover:text-[#1fc3a2]'
              >
                {showPassword}
              </button>

              <div className='mt-2 flex justify-end'>
                <Link
                  href='/forgot-password'
                  className='text-sm font-medium text-[#144167] hover:underline'
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type='submit'
              className='mt-4 w-full transform rounded-xl bg-[#144167] py-4 font-bold text-white shadow-lg transition-all hover:bg-[#0f314d] active:scale-[0.98]'
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
