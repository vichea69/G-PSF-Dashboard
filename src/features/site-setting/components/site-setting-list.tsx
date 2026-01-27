'use client';

import { Button } from '@/components/ui/button';
import { SiteImage, SiteSeoForm } from './site-setting-form';
import { useSiteSetting } from '../hook/use-site-setting';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { UpdateSiteSetting } from '@/server/action/site-setting/site-setting';

export default function SiteSetting() {
  const { data } = useSiteSetting();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(data);

  // React Query mutation for submitting form data
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prevData: any) => ({
      ...prevData,
      [field]: value
    }));
  };

  return (
    <div>
      <form className='space-y-6' onSubmit={handleSubmit}>
        <div className='space-y-6'>
          <SiteSeoForm data={data} />
          <SiteImage />
        </div>

        <div className='flex justify-end'>
          <Button type='button'>Save changes</Button>
        </div>
      </form>
    </div>
  );
}
