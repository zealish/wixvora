import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/providers/theme-provider";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { getSeoSettings } from "@/features/settings/service";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wixvora",
  description: "SaaS Website Builder",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const seoSettings = await getSeoSettings();
  const isProduction = process.env.NODE_ENV === "production";

  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased scrollbar-accent`}
      suppressHydrationWarning
    >
      <head>
        {isProduction &&
          seoSettings.googleAnalytics.enabled &&
          seoSettings.googleAnalytics.measurementId && (
            <GoogleAnalytics
              measurementId={seoSettings.googleAnalytics.measurementId}
            />
          )}

        {seoSettings.searchConsole.verificationToken && (
          <meta
            name="google-site-verification"
            content={seoSettings.searchConsole.verificationToken}
          />
        )}
      </head>
      <body className="flex min-h-full flex-col overflow-x-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
