import ForgetPassword from '@/components/auth-form/forgot-password';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot Password'
};

export default function ForgotPasswordPage() {
  return <ForgetPassword />;
}
