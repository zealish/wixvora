import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { authorize, AuthorizationError } from '@/lib/auth/authorize';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { getAllStaffUsers } from '@/features/users/queries';
import { UserTable } from './components/user-table';

export default async function UsersPage() {
  try {
    await authorize(PERMISSIONS.USERS_VIEW);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      redirect('/staff/access-denied');
    }
    throw error;
  }

  const users = await getAllStaffUsers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Staff Users</h1>
        <Link href="/staff/users/create">
          <Button>Create Staff</Button>
        </Link>
      </div>

      <UserTable users={users} />
    </div>
  );
}
