'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  getUserFromLocalStorage,
  saveUserToLocalStorage,
  type AuthClientUser
} from '@/lib/auth-client';

const DEFAULT_USER: AuthClientUser = {
  id: 5,
  username: 'Admin',
  email: 'admin@gmail.com',
  bio: 'Admin',
  image:
    'https://res.cloudinary.com/dlpsmv2k8/image/upload/v1753329092/photo_2024-05-25_23.00.43_mmr6nw.jpg',
  role: 'admin',
  lastLogin: '2025-09-04'
};

export default function ProfileSettings() {
  const [user, setUser] = useState<AuthClientUser | null>(null);
  const [form, setForm] = useState({
    username: '',
    email: '',
    bio: '',
    password: '',
    image: undefined as string | undefined
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const current = getUserFromLocalStorage();
    if (current) {
      // Prime UI with cached user while API loads
      setUser(current);
      setForm({
        username: current.username ?? '',
        email: current.email ?? '',
        bio: current.bio ?? '',
        password: '',
        image: current.image
      });
    } else {
      // Fallback for first-time UX
      setUser(DEFAULT_USER);
      setForm({
        username: DEFAULT_USER.username,
        email: DEFAULT_USER.email,
        bio: DEFAULT_USER.bio ?? '',
        password: '',
        image: DEFAULT_USER.image
      });
    }
  }, []);

  const initials = useMemo(() => {
    const base = user?.username || user?.email?.split('@')[0] || '';
    return base.slice(0, 2).toUpperCase() || 'U';
  }, [user]);

  const handleAvatarPick = () => fileInputRef.current?.click();
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, image: url }));
  };

  const handleCancel = () => {
    if (!user) return;
    setForm({
      username: user.username ?? '',
      email: user.email ?? '',
      bio: user.bio ?? '',
      password: '',
      image: user.image
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = () => {
    if (!user) return;
    const next: AuthClientUser = {
      ...user,
      username: form.username,
      email: form.email,
      bio: form.bio,
      image: form.image ?? user.image
    };
    setUser(next);
    saveUserToLocalStorage(next);
    toast('Profile saved');
    setForm((f) => ({ ...f, password: '' }));
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
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
