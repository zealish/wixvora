import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { authorize } from "@/lib/auth/authorize";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getActiveCategoriesTree } from "@/features/business-categories/queries";
import { TemplateForm } from "@/features/templates/components";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

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
      <PageHeader
        title="Create Template"
        description="Build a new website template with the block editor"
        actions={
          <Link href="/staff/templates">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        }
      />
      <TemplateForm mode="create" categories={categories} />
    </div>
  );
}
