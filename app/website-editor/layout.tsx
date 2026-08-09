import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export default async function WebsiteEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return <div className="h-screen w-screen overflow-hidden">{children}</div>;
}
