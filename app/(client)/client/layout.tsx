import { redirect } from "next/navigation";
import { Inter } from "next/font/google";
import { getSession } from "@/lib/auth/session";
import { clientNavGroups } from "@/config/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { Topbar } from "@/components/shared/topbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default async function ClientLayout({ children }: LayoutProps<"/">) {
  const session = await getSession();

  if (!session || session.user.accountType !== "CLIENT") {
    redirect("/login");
  }

  const userInitials = session.user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className={`${inter.className} font-sans`}>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar navGroups={clientNavGroups} brandHref="/client" />
          <div className="flex flex-1 flex-col">
            <Topbar
              userImage={session.user.image}
              userInitials={userInitials}
              profileHref="/client/profile"
            />
            <main className="flex-1 p-6">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
