'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';

export default function ProfileSettings() {
  return (
    <div className='flex flex-col gap-6'>
      <Card className='overflow-hidden'>
        <CardContent className='py-6'>
          <div className='grid gap-6'>
            {/* Avatar Row */}
            <div className='grid grid-cols-1 items-center gap-4 md:grid-cols-12'>
              <div className='text-sm font-medium md:col-span-2'>Avatar</div>
              <div className='flex items-center justify-between md:col-span-10'>
                <div className='flex items-center gap-3'>
                  <Avatar className='h-16 w-16'>
                    <AvatarFallback>
                      <span className='h-full w-full rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400' />
                    </AvatarFallback>
                  </Avatar>
                  <div className='text-muted-foreground text-sm'>Optional</div>
                </div>
                <div className='flex items-center gap-2'>
                  <Input type='file' accept='image/*' />
                </div>
              </div>
            </div>

            <Separator />

            {/* Username Row */}
            <div className='grid grid-cols-1 items-center gap-4 md:grid-cols-12'>
              <div className='text-sm font-medium md:col-span-2'>Username</div>
              <div className='md:col-span-3'>
                <Input id='username' placeholder='Your username' />
              </div>
            </div>

            <Separator />

            {/* Email Row */}
            <div className='grid grid-cols-1 items-center gap-4 md:grid-cols-12'>
              <div className='text-sm font-medium md:col-span-2'>Email</div>
              <div className='md:col-span-3'>
                <Input id='email' type='email' placeholder='you@example.com' />
              </div>
            </div>

            <Separator />

            {/* Bio Row */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-12'>
              <div className='text-sm font-medium md:col-span-2'>Bio</div>
              <div className='md:col-span-3'>
                <Textarea
                  id='bio'
                  rows={4}
                  placeholder='Tell us about yourself'
                />
              </div>
            </div>

            <Separator />

            {/* Password Row */}
            <div className='grid grid-cols-1 items-center gap-4 md:grid-cols-12'>
              <div className='text-sm font-medium md:col-span-2'>Password:</div>
              <div className='md:col-span-3'>
                <Input
                  id='password'
                  type='password'
                  placeholder='New password'
                />
              </div>
            </div>

            <div className='flex items-center justify-end gap-2 pt-2'>
              <Button variant='outline' type='button'>
                Cancel
              </Button>
              <Button type='button'>Save Change</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
