import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getAllTemplates } from "@/features/templates/queries";
import TemplatePicker from "@/components/templates/template-picker";

export const metadata: Metadata = {
  title: "Create New Website",
};

export default async function CreateWebsitePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const templates = await getAllTemplates();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Website</h1>
        <p className="text-muted-foreground">
          Choose a template to get started.
        </p>
      </div>

      <TemplatePicker templates={templates} />
    </div>
  );
}
