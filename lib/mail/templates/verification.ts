import type { EmailTemplate } from "../types";

export function getVerificationEmailTemplate(url: string): EmailTemplate {
  return {
    subject: "Verify your email address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verify your email address</h2>
        <p>Click the button below to verify your email address:</p>
        <a href="${url}" style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">
          Verify Email
        </a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${url}</p>
        <p>This link will expire in 24 hours.</p>
      </div>
    `,
    text: `Verify your email address by visiting: ${url}`,
  };
}
