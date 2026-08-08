import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { getActiveCategoriesTree } from "@/features/business-categories/queries";
import { getTemplateById } from "@/features/templates/queries";
import { assertCanModifyTemplate } from "@/features/templates/service";
import { TemplateForm } from "@/features/templates/components";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

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
          <Link href="/staff/templates">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        }
      />
      <TemplateForm
        mode="edit"
        categories={categories}
        initialData={template}
      />
    </div>
  );
}
