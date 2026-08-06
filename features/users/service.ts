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
      accountType: "STAFF",
    },
  });

  if (!result || !result.user) {
    throw new Error("Failed to create user account");
  }

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

export async function updateStaffProfile(data: {
  id: string;
  name: string;
  email: string;
  department?: string;
  position?: string;
  employmentStatus: "ACTIVE" | "INACTIVE" | "TERMINATED";
}): Promise<void> {
  const [existingUser] = await db
    .select()
    .from(user)
    .where(eq(user.id, data.id))
    .limit(1);

  if (!existingUser) {
    throw new Error("User not found");
  }

  await db
    .update(user)
    .set({
      name: data.name,
      email: data.email,
    })
    .where(eq(user.id, data.id));

  const [existingStaff] = await db
    .select()
    .from(staffs)
    .where(eq(staffs.userId, data.id))
    .limit(1);

  if (existingStaff) {
    await db
      .update(staffs)
      .set({
        department: data.department,
        position: data.position,
        employmentStatus: data.employmentStatus,
      })
      .where(eq(staffs.userId, data.id));
  }
}
