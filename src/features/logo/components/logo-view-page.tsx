'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import LogoForm, { type LogoFormData } from './logo-form';
import { api } from '@/lib/api';

export default function LogoViewPage({ logoId }: { logoId: string }) {
  const isNew = logoId === 'new';
  const [editingLogo, setEditingLogo] = useState<any>(isNew ? null : undefined);
  const [loading, setLoading] = useState(!isNew);
  const router = useRouter();
  const qc = useQueryClient();

  useEffect(() => {
    let cancelled = false;
    if (!isNew) {
      setLoading(true);
      const id = String(logoId);
      const url = `/logo/${encodeURIComponent(id)}`;
      // eslint-disable-next-line no-console
      console.log('[LogoView] GET', `${api.defaults.baseURL ?? ''}${url}`);
      api
        .get(url)
        .then((res) => {
          if (cancelled) return;
          const raw = res.data;
          const data = raw?.data ?? raw;
          const logo = (data && (data.logo ?? data)) || undefined;
          // eslint-disable-next-line no-console
          console.log('[LogoView] GET success', {
            status: res.status,
            data: logo
          });
          if (!logo) {
            toast.error('Logo not found');
            router.replace('/admin/logo');
            return;
          }
          setEditingLogo(logo);
        })
        .catch((e: any) => {
          if (cancelled) return;
          const status = e?.response?.status;
          const err = e?.response?.data || e?.message;
          // eslint-disable-next-line no-console
          console.error('[LogoView] GET error', { status, url, err });
          toast.error('Failed to load logo');
          router.replace('/admin/logo');
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }
    return () => {
      cancelled = true;
    };
  }, [isNew, logoId, router]);

  const handleSave = useCallback(
    async (formData: LogoFormData) => {
      try {
        // eslint-disable-next-line no-console
        console.log('[LogoView] FORM DATA', formData);

        const hasFile = !!formData.logo;
        const fd = new FormData();
        fd.append('title', formData.title);
        if (hasFile && formData.logo) fd.append('logo', formData.logo);
        if (isNew) {
          // eslint-disable-next-line no-console
          console.log('[LogoView] POST', `${api.defaults.baseURL ?? ''}/logo`);
          // Let Axios set the correct multipart boundary automatically
          await api.post('/logo', fd);
          toast.success('Logo created');
        } else {
          const url = `/logo/${encodeURIComponent(String(logoId))}`;
          // eslint-disable-next-line no-console
          console.log(
            '[LogoView] PUT',
            `${api.defaults.baseURL ?? ''}${url}`,
            hasFile ? '(multipart)' : '(json)'
          );
          if (hasFile) {
            await api.put(url, fd);
          } else {
            await api.put(url, { title: formData.title });
          }
          toast.success('Logo updated');
        }
        qc.invalidateQueries({ queryKey: ['logo'] });
        router.replace('/admin/logo');
      } catch (e: any) {
        const resp = e?.response?.data;
        const message =
          resp?.message || resp?.error || e?.message || 'Save failed';
        // eslint-disable-next-line no-console
        console.error('[LogoView] SAVE error', {
          status: e?.response?.status,
          data: resp,
          message
        });
        toast.error(message);
      }
    },
    [isNew, logoId, qc, router]
  );

  const handleCancel = useCallback(() => {
    router.push('/admin/logo');
  }, [router]);

  if (loading) return null;

  return (
    <LogoForm
      editingLogo={editingLogo}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
