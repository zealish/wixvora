import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { UserWithProfile } from '@/features/users/types';

interface UserTableProps {
  users: UserWithProfile[];
}

export function UserTable({ users }: UserTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground">
              No staff users found
            </TableCell>
          </TableRow>
        ) : (
          users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.staff?.department || '-'}</TableCell>
              <TableCell>{user.staff?.position || '-'}</TableCell>
              <TableCell>{user.staff?.employmentStatus || '-'}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
