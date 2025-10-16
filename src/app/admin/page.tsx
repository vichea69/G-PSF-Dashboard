import { redirect } from 'next/navigation';
export const metadata = { title: 'Dashboard' };

export default async function Dashboard() {
  redirect('/admin/overview');
}
