"use server";

import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/auth";
import { clients } from "@/lib/db/schema/clients";
import { auth } from "@/lib/auth/auth";
import { createAuditLog } from "@/features/audit/service";
import { signupSchema } from "./validation";
import type { AuthResult } from "./types";
import { eq } from "drizzle-orm";
import { z } from "zod";

export async function registerClient(data: unknown): Promise<AuthResult> {
  try {
    const validated = signupSchema.parse(data);

    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, validated.email))
      .limit(1);

    if (existingUser.length > 0) {
      return { success: false, error: "Email already registered" };
    }

    const result = await auth.api.signUpEmail({
      body: {
        email: validated.email,
        password: validated.password,
        name: validated.name,
        accountType: "CLIENT",
      },
    });

    if (!result || !result.user) {
      return { success: false, error: "Failed to create account" };
    }

    await db.insert(clients).values({
      userId: result.user.id,
      displayName: validated.name,
      companyName: validated.companyName,
    });

    await createAuditLog({
      userId: result.user.id,
      action: "CLIENT_REGISTERED",
      entity: "user",
      entityId: result.user.id,
      metadata: { email: validated.email },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function resendVerificationEmail(
  email: string
): Promise<AuthResult> {
  try {
    const emailSchema = z.string().email("Invalid email address");
    const validated = emailSchema.parse(email);

    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, validated))
      .limit(1);

    if (existingUser.length === 0) {
      return { success: false, error: "Email not found" };
    }

    const userData = existingUser[0];

    if (userData?.emailVerified) {
      return { success: false, error: "Email already verified" };
    }

    await auth.api.sendVerificationEmail({
      body: {
        email: validated,
        callbackURL: "/",
      },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to resend verification email" };
  }
}

export async function requestPasswordReset(
  email: string
): Promise<AuthResult> {
  try {
    const emailSchema = z.string().email("Invalid email address");
    const validated = emailSchema.parse(email);

    await auth.api.requestPasswordReset({
      body: {
        email: validated,
        redirectTo: "/reset-password",
      },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to send password reset email" };
  }
}

export async function resetPassword(
  token: string,
  newPassword: string
): Promise<AuthResult> {
  try {
    const passwordSchema = z
      .string()
      .min(8, "Password must be at least 8 characters");
    const validated = passwordSchema.parse(newPassword);

    await auth.api.resetPassword({
      body: {
        token,
        newPassword: validated,
      },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to reset password" };
  }
}
