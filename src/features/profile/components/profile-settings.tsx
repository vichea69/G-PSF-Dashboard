'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { FileModal } from '@/components/modal/file-modal';
import type { MediaFile } from '@/features/media/types/media-type';
import { resolveApiAssetUrl, toApiAssetPath } from '@/lib/asset-url';
import { handleImageUpload } from '@/lib/tiptap-utils';
import { updateProfile } from '@/server/action/profile/profile';
import {
  getUserFromLocalStorage,
  saveUserToLocalStorage
} from '@/lib/auth-client';
import { useTranslate } from '@/hooks/use-translate';

type ProfileRecord = {
  username?: string | null;
  email?: string | null;
  bio?: string | null;
  image?: string | null;
};

type ProfileFormValues = {
  username: string;
  email: string;
  bio: string;
  image: string;
  password: string;
};

interface ProfileSettingsProps {
  profile?: ProfileRecord | null;
}

function createFormValues(profile?: ProfileRecord | null): ProfileFormValues {
  return {
    username: profile?.username ?? '',
    email: profile?.email ?? '',
    bio: profile?.bio ?? '',
    image: profile?.image ?? '',
    password: ''
  };
}

function getInitials(value: string): string {
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, 2).toUpperCase() : 'PR';
}

export default function ProfileSettings({ profile }: ProfileSettingsProps) {
  const { t } = useTranslate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<ProfileFormValues>(() =>
    createFormValues(profile)
  );
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);

  useEffect(() => {
    setFormData(createFormValues(profile));
  }, [profile]);

  const avatarPreviewUrl = useMemo(
    () => resolveApiAssetUrl(formData.image),
    [formData.image]
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      const username = formData.username.trim();
      const email = formData.email.trim();
      const password = formData.password.trim();

      if (!username) {
        throw new Error(t('profile.validation.usernameRequired'));
      }

      if (!email) {
        throw new Error(t('profile.validation.emailRequired'));
      }

      const payload = {
        username,
        email,
        bio: formData.bio.trim() || null,
        image: formData.image.trim() || null,
        ...(password ? { password } : {})
      };

      return updateProfile(payload);
    },
    onSuccess: (result: any) => {
      const returnedUser =
        result?.user ?? result?.data?.user ?? result?.data ?? null;
      const currentUser = getUserFromLocalStorage();
      if (currentUser) {
        const nextUsername =
          (typeof returnedUser?.username === 'string'
            ? returnedUser.username.trim()
            : '') ||
          formData.username.trim() ||
          currentUser.username;
        const nextEmail =
          (typeof returnedUser?.email === 'string'
            ? returnedUser.email.trim()
            : '') ||
          formData.email.trim() ||
          currentUser.email;
        const nextBio =
          (typeof returnedUser?.bio === 'string' ? returnedUser.bio : null) ??
          formData.bio.trim() ??
          '';
        const nextImage = toApiAssetPath(
          (typeof returnedUser?.image === 'string'
            ? returnedUser.image
            : null) ?? formData.image.trim()
        );

        saveUserToLocalStorage({
          ...currentUser,
          username: nextUsername,
          email: nextEmail,
          bio: nextBio,
          image: nextImage
        });
      }

      toast.success(t('profile.toast.updated'));
      setFormData((prev) => ({ ...prev, password: '' }));
      router.refresh();
    },
    onError: (error: any) => {
      toast.error(error?.message ?? t('profile.toast.updateFailed'));
    }
  });

  const handleFieldChange = (field: keyof ProfileFormValues, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    // Keep cancel simple: leave the profile form and go back to the admin overview page.
    router.push('/admin/overview');
  };

  const handleSelectImageFromMedia = (file: MediaFile) => {
    const selectedUrl = (file.url ?? file.thumbnail ?? '').trim();
    if (!selectedUrl) {
      toast.error(t('profile.validation.invalidMediaUrl'));
      return;
    }

    handleFieldChange('image', toApiAssetPath(selectedUrl));
  };

  const handleUploadImageFromDevice = async (files: File[]) => {
    const firstFile = files[0];
    if (!firstFile) return;

    setImageUploadLoading(true);
    try {
      const result = await handleImageUpload(firstFile);
      if (!result?.url) {
        throw new Error(t('profile.validation.missingUploadUrl'));
      }

      handleFieldChange('image', toApiAssetPath(result.url));
      await queryClient.invalidateQueries({
        queryKey: ['media'],
        exact: false
      });
      toast.success(t('profile.toast.avatarSelected'));
    } catch (error: any) {
      toast.error(error?.message ?? t('profile.toast.avatarUploadFailed'));
    } finally {
      setImageUploadLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveMutation.mutate();
  };

  const isBusy = saveMutation.isPending || imageUploadLoading;

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className='flex flex-col gap-6'>
          <Card className='overflow-hidden'>
            <CardContent className='py-6'>
              <div className='grid gap-6'>
                <div className='grid grid-cols-1 items-center gap-4 md:grid-cols-12'>
                  <div className='text-sm font-medium md:col-span-2'>
                    {t('profile.form.avatar')}
                  </div>
                  <div className='flex flex-col gap-4 md:col-span-10 md:flex-row md:items-center md:justify-between'>
                    <div className='flex items-center gap-3'>
                      <Avatar className='h-16 w-16'>
                        {avatarPreviewUrl ? (
                          <AvatarImage
                            src={avatarPreviewUrl}
                            alt={t('profile.form.avatarAlt')}
                          />
                        ) : (
                          <AvatarFallback className='text-sm font-semibold'>
                            {getInitials(formData.username)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </div>

                    <div className='flex flex-wrap items-center gap-2'>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => setImagePickerOpen(true)}
                        disabled={isBusy}
                      >
                        {t('profile.form.selectFromMedia')}
                      </Button>
                      {formData.image ? (
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() => handleFieldChange('image', '')}
                          disabled={isBusy}
                        >
                          {t('profile.form.clear')}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className='grid grid-cols-1 items-center gap-4 md:grid-cols-12'>
                  <div className='text-sm font-medium md:col-span-2'>
                    {t('profile.form.username')}
                  </div>
                  <div className='md:col-span-4'>
                    <Input
                      id='username'
                      value={formData.username}
                      onChange={(event) =>
                        handleFieldChange('username', event.target.value)
                      }
                      placeholder={t('profile.form.usernamePlaceholder')}
                      disabled={isBusy}
                    />
                  </div>
                </div>

                <Separator />

                <div className='grid grid-cols-1 items-center gap-4 md:grid-cols-12'>
                  <div className='text-sm font-medium md:col-span-2'>
                    {t('profile.form.email')}
                  </div>
                  <div className='md:col-span-4'>
                    <Input
                      id='email'
                      type='email'
                      value={formData.email}
                      onChange={(event) =>
                        handleFieldChange('email', event.target.value)
                      }
                      placeholder={t('profile.form.emailPlaceholder')}
                      disabled={isBusy}
                    />
                  </div>
                </div>

                <Separator />

                <div className='grid grid-cols-1 gap-4 md:grid-cols-12'>
                  <div className='text-sm font-medium md:col-span-2'>
                    {t('profile.form.bio')}
                  </div>
                  <div className='md:col-span-4'>
                    <Textarea
                      id='bio'
                      value={formData.bio}
                      onChange={(event) =>
                        handleFieldChange('bio', event.target.value)
                      }
                      rows={4}
                      placeholder={t('profile.form.bioPlaceholder')}
                      disabled={isBusy}
                    />
                  </div>
                </div>

                <Separator />

                <div className='grid grid-cols-1 items-center gap-4 md:grid-cols-12'>
                  <div className='text-sm font-medium md:col-span-2'>
                    {t('profile.form.password')}
                  </div>
                  <div className='md:col-span-4'>
                    <Input
                      id='password'
                      type='password'
                      value={formData.password}
                      onChange={(event) =>
                        handleFieldChange('password', event.target.value)
                      }
                      placeholder={t('profile.form.passwordPlaceholder')}
                      disabled={isBusy}
                    />
                    <p className='text-muted-foreground mt-2 text-xs'>
                      {t('profile.form.passwordHint')}
                    </p>
                  </div>
                </div>

                <div className='flex items-center justify-end gap-2 pt-2'>
                  <Button
                    variant='outline'
                    type='button'
                    onClick={handleCancel}
                    disabled={isBusy}
                  >
                    {t('profile.form.cancel')}
                  </Button>
                  <Button type='submit' disabled={isBusy}>
                    {saveMutation.isPending
                      ? t('profile.form.saving')
                      : t('profile.form.saveChanges')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>

      <FileModal
        isOpen={imagePickerOpen}
        onClose={() => setImagePickerOpen(false)}
        onSelect={handleSelectImageFromMedia}
        onUploadFromDevice={handleUploadImageFromDevice}
        loading={imageUploadLoading}
        title={t('profile.modal.title')}
        description={t('profile.modal.description')}
        types={['image']}
        accept='image/*'
      />
    </>
  );
}
