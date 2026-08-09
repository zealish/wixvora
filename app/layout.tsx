import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Poppins, Playfair_Display, Fira_Code } from "next/font/google";
import { ThemeProvider } from "@/providers/theme-provider";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { getSeoSettings } from "@/features/settings/service";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  weight: ["400", "500"],
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
      className={`${inter.variable} ${plusJakartaSans.variable} ${poppins.variable} ${playfairDisplay.variable} ${firaCode.variable} scrollbar-accent h-full antialiased`}
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
