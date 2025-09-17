import AdminLogin from '@/components/auth-form/login-form';
import { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Sign in Page '
};
const login = () => {
  return <AdminLogin />;
};
export default login;
