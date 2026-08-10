import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getWebsiteById, canUserEditWebsite } from "@/features/websites/queries";
import WebsiteEditorWrapper from "@/components/website-editor/website-editor-client";

export const metadata = {
  title: "Edit Website",
};

export default async function WebsiteEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const website = await getWebsiteById(id);
  if (!website) notFound();

   const canEdit = await canUserEditWebsite(id, session.user.id);
   if (!canEdit) redirect("/dashboard");

   // Use pages from database if available (multi-page support)
   const initialPages = website.pages && website.pages.length > 0 
     ? website.pages // Load all pages from database
     : [{ // Fallback to legacy single-page format
         id: "home",
         title: "Beranda (Home)",
         slug: "/",
         sections: website.sections || [],
         pageSettings: website.pageSettings || { title: website.name, bgColor: "#ffffff", fontFamily: "font-sans" },
         isHomePage: true,
         sortOrder: 0,
       }];

   return (
     <WebsiteEditorWrapper
       websiteId={website.id}
       initialPages={initialPages}
     />
   );
}
