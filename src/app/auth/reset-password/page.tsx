import { Metadata } from 'next';
import ResetPassword from '@/components/auth-form/reset-password';

export const metadata: Metadata = {
  title: 'Reset Password'
};

type ResetPasswordPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ResetPasswordPage({
  searchParams
}: ResetPasswordPageProps) {
  const resolvedParams = await searchParams;
  const rawToken = resolvedParams?.token;
  const token = Array.isArray(rawToken)
    ? rawToken[0]
    : typeof rawToken === 'string'
      ? rawToken
      : '';
  return <ResetPassword token={token} />;
}
