import { redirect } from 'next/navigation';
import { getSession, isAdmin } from '@/lib/session';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isAdmin(getSession())) {
    redirect('/?auth=required');
  }
  return <>{children}</>;
}
