import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { authorize } from "@/lib/auth/authorize";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { CategoryForm } from "@/features/business-categories/components/category-form";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "Create Category",
};

export default async function CreateCategoryPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  await authorize(PERMISSIONS.CATEGORIES_CREATE);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Category"
        description="Create a new business category"
      />

      <div className="max-w-2xl">
        <CategoryForm mode="create" />
      </div>
    </div>
  );
}
