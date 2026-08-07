import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { authorize } from "@/lib/auth/authorize";
import { PERMISSIONS } from "@/lib/auth/permissions";
import {
  getCategoryById,
  getNextDisplayOrder,
} from "@/features/business-categories/queries";
import { CategoryForm } from "@/features/business-categories/components/category-form";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "Create Sub-Category",
};

interface CreateSubCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function CreateSubCategoryPage({
  params,
}: CreateSubCategoryPageProps) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  await authorize(PERMISSIONS.CATEGORIES_CREATE);

  const parent = await getCategoryById(id);
  if (!parent) notFound();

  const suggestedOrder = await getNextDisplayOrder(id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Sub-Category"
        description={`Create a sub-category under ${parent.name}`}
      />

      <div className="max-w-2xl">
        <CategoryForm
          mode="create"
          parentId={id}
          parentName={parent.name}
          suggestedOrder={suggestedOrder}
        />
      </div>
    </div>
  );
}
