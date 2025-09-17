import { Metadata } from 'next';
import ResetPassword from '@/components/auth-form/reset-password';

export const metadata: Metadata = {
  title: 'Reset Password'
};

const ResetPasswordPage = () => {
  return (
    <div>
      <ResetPassword />
    </div>
  );
};

export default ResetPasswordPage;
