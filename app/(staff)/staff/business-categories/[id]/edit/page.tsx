import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { authorize } from "@/lib/auth/authorize";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getCategoryById } from "@/features/business-categories/queries";
import { CategoryForm } from "@/features/business-categories/components/category-form";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "Edit Category",
};

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  await authorize(PERMISSIONS.CATEGORIES_UPDATE);

  const category = await getCategoryById(id);
  if (!category) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Category"
        description={`Editing ${category.name}`}
      />

      <div className="max-w-2xl">
        <CategoryForm
          mode="edit"
          initialData={{
            id: category.id,
            name: category.name,
            slug: category.slug,
            icon: category.icon,
            displayOrder: category.displayOrder,
            status: category.status,
            parentId: category.parentId,
          }}
        />
      </div>
    </div>
  );
}
