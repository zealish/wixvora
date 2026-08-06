import { db } from "@/lib/db";
import { user, staffs, clients, staffRoles } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { eq } from "drizzle-orm";
import type { CreateStaffInput } from "./validation";

export async function createStaffWithRoles(
  input: CreateStaffInput,
  assignedBy: string
): Promise<{ userId: string; staffId: string }> {
  const existingUser = await db
    .select()
    .from(user)
    .where(eq(user.email, input.email))
    .limit(1);

  if (existingUser.length > 0) {
    throw new Error("Email already registered");
  }

  const existingClient = await db
    .select()
    .from(clients)
    .innerJoin(user, eq(clients.userId, user.id))
    .where(eq(user.email, input.email))
    .limit(1);

  if (existingClient.length > 0) {
    throw new Error("User already exists as a client");
  }

  const result = await auth.api.signUpEmail({
    body: {
      email: input.email,
      password: input.password,
      name: input.name,
    },
  });

  if (!result || !result.user) {
    throw new Error("Failed to create user account");
  }

  await db
    .update(user)
    .set({ accountType: "STAFF" })
    .where(eq(user.id, result.user.id));

  const [staff] = await db
    .insert(staffs)
    .values({
      userId: result.user.id,
      department: input.department,
      position: input.position,
      employmentStatus: "ACTIVE",
    })
    .returning();

  if (!staff) {
    throw new Error("Failed to create staff profile");
  }

  await db.insert(staffRoles).values(
    input.roleIds.map((roleId) => ({
      staffId: staff.id,
      roleId,
      assignedBy,
    }))
  );

  return { userId: result.user.id, staffId: staff.id };
}
