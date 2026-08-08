import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getTemplateById } from "@/features/templates/queries";
import { assertCanModifyTemplate } from "@/features/templates/service";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { TemplateForm } from "@/features/templates/components";
import { getActiveCategoriesTree } from "@/features/business-categories/queries";

export const metadata: Metadata = {
  title: "Edit Template",
};

export default async function EditTemplatePage({
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

  const categories = await getActiveCategoriesTree();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit Template: ${template.name}`}
        description={`Last saved ${template.updatedAt.toLocaleDateString()}`}
        actions={
          <>
            <Link href="/staff/templates">
              <Button variant="outline" className="mr-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <Link href={`/templates-editor/${id}`}>
              <Button>
                Edit with Full Block Editor
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </>
        }
      />
      
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <TemplateForm mode="edit" categories={categories} initialData={template} />
      </div>
    </div>
  );
}
