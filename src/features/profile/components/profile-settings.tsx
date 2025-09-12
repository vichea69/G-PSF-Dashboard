'use client';

import { useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { type AuthClientUser } from '@/lib/auth-client';
import { redirect } from 'next/navigation';

export default function ProfileSettings() {
  const [user] = useState<AuthClientUser | null>(null);
  const [form, setForm] = useState({
    username: '',
    email: '',
    bio: '',
    password: '',
    image: undefined as string | undefined
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarPick = () => fileInputRef.current?.click();
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, image: url }));
  };
  //cancel button
  const handleCancel = () => {
    redirect('/admin/overview');
  };

  const handleSave = () => {
    toast.success('Implement save logic here');
  };

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
                    {form.image || user?.image ? (
                      <AvatarImage
                        src={form.image || user?.image || ''}
                        alt='Avatar'
                      />
                    ) : (
                      <AvatarFallback>
                        <span className='h-full w-full rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400' />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className='text-muted-foreground text-sm'>Optional</div>
                </div>
                <div className='flex items-center gap-2'>
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='image/*'
                    className='hidden'
                    onChange={handleAvatarChange}
                  />
                  <Button variant='outline' onClick={handleAvatarPick}>
                    Change
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* Username Row */}
            <div className='grid grid-cols-1 items-center gap-4 md:grid-cols-12'>
              <div className='text-sm font-medium md:col-span-2'>Username</div>
              <div className='md:col-span-3'>
                <Input
                  id='username'
                  value={form.username}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, username: e.target.value }))
                  }
                />
              </div>
            </div>

            <Separator />

            {/* Email Row */}
            <div className='grid grid-cols-1 items-center gap-4 md:grid-cols-12'>
              <div className='text-sm font-medium md:col-span-2'>Email</div>
              <div className='md:col-span-3'>
                <Input
                  id='email'
                  type='email'
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder='you@example.com'
                />
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
                  value={form.bio}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, bio: e.target.value }))
                  }
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
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  placeholder='New password'
                />
              </div>
            </div>

            <div className='flex items-center justify-end gap-2 pt-2'>
              <Button variant='outline' onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={false}>
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
