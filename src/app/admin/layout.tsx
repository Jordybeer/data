import { redirect } from 'next/navigation';
import { getSession, isAdmin } from '@/lib/session';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isAdmin(await getSession())) {
    redirect('/?auth=required');
  }
  return <>{children}</>;
}
