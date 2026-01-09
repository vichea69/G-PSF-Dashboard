import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className='flex min-h-screen flex-col bg-gradient-to-br from-[#4ab1be] to-[#1fc3a2] lg:flex-row'>
      {/* Left Section - Teal Background with Illustrations */}
      <div className='relative hidden overflow-hidden lg:block lg:w-2/5'>
        {/* Decorative circles in bottom left */}
        <div className='absolute bottom-0 left-0 h-40 w-40 -translate-x-1/3 translate-y-1/3 rounded-full border-[24px] border-white/10 sm:h-52 sm:w-52 sm:border-[32px] lg:h-64 lg:w-64 lg:border-[40px]' />
        <div className='absolute bottom-12 left-8 h-20 w-20 rounded-full border-[14px] border-white/10 sm:bottom-16 sm:left-12 sm:h-28 sm:w-28 sm:border-[18px] lg:bottom-20 lg:left-20 lg:h-32 lg:w-32 lg:border-[20px]' />

        {/* Content */}
        <div className='relative z-10 flex w-full flex-col justify-start gap-8 p-8 sm:p-10 lg:justify-between lg:p-12'>
          <div>
            <p className='mb-4 text-base text-white sm:mb-6 sm:text-lg'>
              Welcome!
            </p>
            <h1 className='mb-4 text-3xl font-bold text-white sm:mb-6 sm:text-4xl lg:text-5xl'>
              G-PSF Monitoring System
            </h1>
            <p className='max-w-md text-base text-white sm:text-lg'>
              The Royal Government of Cambodia considers the private sector as a
              key partner and engine of national economic growth.
            </p>
          </div>

          {/* Illustration */}
          <div className='flex justify-center'>
            <img
              src='/assets/undraw_online-community_3o0l%201.svg'
              alt='Online community illustration'
              className='w-full max-w-xs sm:max-w-sm lg:max-w-md'
            />
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className='flex min-h-screen w-full items-center justify-center p-6 sm:p-12 lg:w-3/5'>
        <div className='rounded-1xl w-full max-w-[600px] bg-white p-6 shadow-lg sm:rounded-3xl sm:p-8 lg:min-h-[650px] lg:p-10'>
          {/* Logo */}
          <div className='mb-4 flex justify-center sm:mb-6'>
            <img
              src='/assets/gpsf_logo.png'
              alt='Cambodia G-PSF Logo'
              className='h-16 sm:h-20'
            />
          </div>

          {/* Sign in heading */}
          <h2 className='mb-6 text-center text-lg text-[#717680] sm:mb-10 sm:text-2xl'>
            Sign in to your account
          </h2>

          {/* Login Form */}
          <form className='space-y-4 sm:space-y-6'>
            <div>
              <label
                htmlFor='email'
                className='mb-2 block text-sm font-medium text-[#414651]'
              >
                Email
              </label>
              <input
                type='email'
                id='email'
                placeholder='privatesectoruser@gmail.com'
                className='w-full rounded-lg border border-[#e6e6e6] px-4 py-3 text-[#414651] placeholder:text-[#a4a7ae] focus:ring-2 focus:ring-[#144167] focus:outline-none'
              />
            </div>

            <div>
              <label
                htmlFor='password'
                className='mb-2 block text-sm font-medium text-[#414651]'
              >
                Password
              </label>
              <input
                type='password'
                id='password'
                placeholder='Your password'
                className='w-full rounded-lg border border-[#e6e6e6] px-4 py-3 text-[#414651] placeholder:text-[#a4a7ae] focus:ring-2 focus:ring-[#144167] focus:outline-none'
              />
              <div className='mt-2 flex justify-end'>
                <Link
                  href='/forgot-password'
                  className='text-sm text-[#000000] underline hover:text-[#144167]'
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type='submit'
              className='mt-6 w-full rounded-lg bg-[#144167] py-3 font-medium text-white transition-colors hover:bg-[#144167]/90 sm:mt-8 sm:py-4'
            >
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
