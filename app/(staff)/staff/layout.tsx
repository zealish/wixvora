import { redirect } from 'next/navigation';
import Link from 'next/link';
import { eq, and, isNull } from 'drizzle-orm';
import { getSession } from '@/lib/auth/session';
import { staffNavItems } from '@/config/navigation';
import { db } from '@/lib/db';
import { staffs, staffRoles, roles, rolePermissions, permissions } from '@/lib/db/schema';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import type { PermissionKey } from '@/types/rbac';

async function getUserPermissions(userId: string): Promise<Set<PermissionKey>> {
  const result = await db
    .select({
      permissionKey: permissions.key,
      roleCode: roles.code,
    })
    .from(staffs)
    .innerJoin(staffRoles, eq(staffs.id, staffRoles.staffId))
    .innerJoin(roles, eq(staffRoles.roleId, roles.id))
    .leftJoin(rolePermissions, eq(roles.id, rolePermissions.roleId))
    .leftJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(and(eq(staffs.userId, userId), isNull(staffs.deletedAt), isNull(roles.deletedAt)));

  const isSuperAdmin = result.some((row) => row.roleCode === 'SUPER_ADMIN');
  
  if (isSuperAdmin) {
    return new Set(staffNavItems.filter((item) => item.permission).map((item) => item.permission!));
  }

  return new Set(result.map((row) => row.permissionKey).filter(Boolean) as PermissionKey[]);
}

export default async function StaffLayout({ children }: LayoutProps<'/'>) {
  const session = await getSession();

  if (!session || session.user.accountType !== 'STAFF') {
    redirect('/login');
  }

  const userPermissions = await getUserPermissions(session.user.id);
  const filteredNavItems = staffNavItems.filter(
    (item) => !item.permission || userPermissions.has(item.permission)
  );

  const userInitials = session.user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b px-6 py-4">
            <Link href="/staff" className="text-lg font-bold">
              Wixvora
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {filteredNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton render={<Link href={item.href} />}>
                    {item.title}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <div className="flex flex-1 flex-col">
          <header className="border-b">
            <div className="flex h-16 items-center justify-end px-6">
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
                  <Avatar>
                    <AvatarImage src={session.user.image || undefined} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem render={<Link href="/staff/profile" />}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    render={
                      <form action="/api/auth/sign-out" method="POST">
                        <button type="submit" className="w-full text-left">
                          Sign Out
                        </button>
                      </form>
                    }
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
