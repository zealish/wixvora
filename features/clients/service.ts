import { db } from "@/lib/db";
import { user, clients } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { eq } from "drizzle-orm";
import type { CreateClientInput } from "./validation";

export async function createClientUser(
  input: CreateClientInput
): Promise<{ userId: string; clientId: string }> {
  const existingUser = await db
    .select()
    .from(user)
    .where(eq(user.email, input.email))
    .limit(1);

  if (existingUser.length > 0) {
    throw new Error("Email already registered");
  }

  const result = await auth.api.signUpEmail({
    body: {
      email: input.email,
      password: input.password,
      name: input.name,
      accountType: "CLIENT",
    },
  });

  if (!result || !result.user) {
    throw new Error("Failed to create user account");
  }

  const [client] = await db
    .insert(clients)
    .values({
      userId: result.user.id,
      displayName: input.displayName,
      companyName: input.companyName,
      phone: input.phone,
      status: "ACTIVE",
    })
    .returning();

  if (!client) {
    throw new Error("Failed to create client profile");
  }

  return { userId: result.user.id, clientId: client.id };
}
