import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { authorize } from "@/lib/auth/authorize";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { getCategoriesTree } from "@/features/business-categories/queries";
import { CategoryDataTable } from "@/features/business-categories/components/category-data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Business Categories",
};

export default async function BusinessCategoriesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  await authorize(PERMISSIONS.CATEGORIES_VIEW);

  const categories = await getCategoriesTree();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Categories"
        description="Manage business categories and sub-categories"
        actions={
          <Link href="/staff/business-categories/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Category
            </Button>
          </Link>
        }
      />

      <CategoryDataTable data={categories} />
    </div>
  );
}
