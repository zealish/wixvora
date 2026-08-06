import { redirect } from "next/navigation";
import { eq, and, isNull } from "drizzle-orm";
import { Inter } from "next/font/google";
import { getSession } from "@/lib/auth/session";
import { staffNavGroups } from "@/config/navigation";
import { db } from "@/lib/db";
import {
  staffs,
  staffRoles,
  roles,
  rolePermissions,
  permissions,
} from "@/lib/db/schema";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { Topbar } from "@/components/shared/topbar";
import type { PermissionKey } from "@/types/rbac";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

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
    .where(
      and(
        eq(staffs.userId, userId),
        isNull(staffs.deletedAt),
        isNull(roles.deletedAt)
      )
    );

  const isSuperAdmin = result.some((row) => row.roleCode === "SUPER_ADMIN");

  if (isSuperAdmin) {
    const allItems = staffNavGroups.flatMap((g) => g.items);
    return new Set(
      allItems.filter((item) => item.permission).map((item) => item.permission!)
    );
  }

  return new Set(
    result.map((row) => row.permissionKey).filter(Boolean) as PermissionKey[]
  );
}

export default async function StaffLayout({ children }: LayoutProps<"/">) {
  const session = await getSession();

  if (!session || session.user.accountType !== "STAFF") {
    redirect("/login");
  }

  const userPermissions = await getUserPermissions(session.user.id);

  // Filter groups and their items based on permissions
  const filteredNavGroups = staffNavGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.permission || userPermissions.has(item.permission)
      ),
    }))
    .filter((group) => group.items.length > 0);

  const userInitials = session.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className={`${inter.className} font-sans`}>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar navGroups={filteredNavGroups} brandHref="/staff" />
          <div className="flex flex-1 flex-col">
            <Topbar
              userImage={session.user.image}
              userInitials={userInitials}
              profileHref="/staff/profile"
            />
            <main className="flex-1 p-6">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
