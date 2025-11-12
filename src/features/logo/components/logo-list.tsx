'use client';
import { useLogo } from '@/features/logo/hook/use-logo';
import { LogoTableList } from './logo-tables';

export default function LogoListPage() {
  const { data } = useLogo();
  const logos = (data?.data?.logos ?? []) as any[];
  return <LogoTableList data={logos} />;
}
