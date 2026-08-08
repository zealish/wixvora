import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { authorize } from "@/lib/auth/authorize";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getActiveCategoriesTree } from "@/features/business-categories/queries";
import { TemplateForm } from "@/features/templates/components";

export const metadata: Metadata = {
  title: "Create Template",
};

export default async function CreateTemplatePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  await authorize(PERMISSIONS.TEMPLATES_CREATE);

  const categories = await getActiveCategoriesTree();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Create Template</h1>
      
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <TemplateForm mode="create" categories={categories} />
      </div>
    </div>
  );
}
