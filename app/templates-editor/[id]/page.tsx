import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getTemplateById } from "@/features/templates/queries";
import { assertCanModifyTemplate } from "@/features/templates/service";
import TemplateEditorWrapper from "@/components/website-editor/template-editor";

export const metadata = {
  title: "Edit Template",
};

export default async function TemplateEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const template = await getTemplateById(id);
  if (!template) notFound();

  try {
    await assertCanModifyTemplate(template.id, session.user.id, "update");
  } catch {
    redirect("/staff/access-denied");
  }

  const initialPages = [{
    id: "home",
    title: "Beranda (Home)",
    slug: "/",
    sections: template.sections || [],
    pageSettings: template.pageSettings || { title: template.name, bgColor: "#ffffff", fontFamily: "font-sans" },
    isHomePage: true,
    sortOrder: 0,
  }];

  return (
    <TemplateEditorWrapper
      templateId={template.id}
      templateName={template.name}
      initialPages={initialPages}
    />
  );
}
