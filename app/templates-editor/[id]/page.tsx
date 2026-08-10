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

  // Helper to deep parse sections with elements
  const deepParseSections = (sections: any): any[] => {
    if (!Array.isArray(sections)) return [];
    
    return sections.map((section: any) => {
      let parsedSection = { ...section };
      
      // Parse elements if it's a string
      if (typeof section.elements === 'string') {
        try {
          parsedSection.elements = JSON.parse(section.elements);
        } catch (e) {
          console.error("Failed to parse elements:", e);
          parsedSection.elements = [];
        }
      } else if (!Array.isArray(section.elements)) {
        parsedSection.elements = [];
      }
      
      return parsedSection;
    });
  };

  // Use pages from template if available, otherwise fallback to legacy format
  const initialPages = template.pages && Array.isArray(template.pages) && template.pages.length > 0 
    ? template.pages.map((p: any) => ({
        ...p,
        sections: deepParseSections(p.sections),
        pageSettings: typeof p.pageSettings === 'string' 
          ? JSON.parse(p.pageSettings)
          : p.pageSettings || { title: template.name, bgColor: '#ffffff', fontFamily: 'font-sans' },
      }))
    : [{
        id: "home",
        title: "Beranda (Home)",
        slug: "/",
        sections: template.sections || [],
        pageSettings: template.pageSettings || { title: template.name, bgColor: "#ffffff", fontFamily: "font-sans" },
        isHomePage: true,
        sortOrder: 0,
      }];

  console.log("📋 [TEMPLATE] Initial pages:", initialPages);

  return (
    <TemplateEditorWrapper
      templateId={template.id}
      templateName={template.name}
      initialPages={initialPages}
    />
  );
}
