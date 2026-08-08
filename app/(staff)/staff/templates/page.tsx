import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { authorize } from "@/lib/auth/authorize";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getAllTemplates } from "@/features/templates/queries";
import { TemplateDataTable } from "@/features/templates/components";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Website Templates",
};

export default async function TemplatesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  await authorize(PERMISSIONS.TEMPLATES_VIEW);

  const templates = await getAllTemplates();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Website Templates"
        description="Create and manage website templates for clients"
        actions={
          <Link href="/staff/templates/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </Link>
        }
      />

      <TemplateDataTable data={templates} />
    </div>
  );
}
