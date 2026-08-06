import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import { user, session, account, verification } from "@/lib/db/schema/auth";
import {
  sendEmail,
  getVerificationEmailTemplate,
  getPasswordResetEmailTemplate,
} from "@/lib/mail";
import { eq } from "drizzle-orm";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      const template = getPasswordResetEmailTemplate(url);
      void sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
        ...(template.text && { text: template.text }),
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      const template = getVerificationEmailTemplate(url);
      void sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
        ...(template.text && { text: template.text }),
      });
    },
    autoSignInAfterVerification: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  user: {
    additionalFields: {
      accountType: {
        type: "string",
        required: true,
        input: true,
        returned: true,
      },
    },
  },
  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
    hooks: {
      after: [
        {
          matcher: (context: any) =>
            context.path === "/sign-in/email" ||
            context.path === "/verify-email",
          handler: async (context: any) => {
            if (context.body && "user" in context.body) {
              const userData = context.body.user as { accountType?: string };
              const sessionData = context.body.session as {
                token: string;
                expiresAt: Date;
              };

              if (
                userData?.accountType === "STAFF" &&
                sessionData?.token &&
                context.request
              ) {
                const rememberMe =
                  context.request.method === "POST" &&
                  context.request.headers.get("content-type")?.includes("json")
                    ? await context.request
                        .clone()
                        .json()
                        .then((body: any) => body.rememberMe !== false)
                        .catch(() => true)
                    : true;

                if (rememberMe) {
                  const staffExpiration = new Date(
                    Date.now() + 60 * 60 * 24 * 1000
                  );
                  await db
                    .update(session)
                    .set({ expiresAt: staffExpiration })
                    .where(eq(session.token, sessionData.token));

                  sessionData.expiresAt = staffExpiration;
                }
              }
            }
          },
        },
      ],
    },
  },
  trustedOrigins: process.env.BETTER_AUTH_TRUSTED_ORIGINS
    ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(",")
    : ["http://localhost:3000"],
});
