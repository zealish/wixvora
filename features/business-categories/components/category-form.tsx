"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/toast";
import { CategoryIconPicker } from "./category-icon-picker";
import { createCategorySchema, updateCategorySchema } from "../validation";
import type { CreateCategoryInput, UpdateCategoryInput } from "../validation";
import {
  createCategoryAction,
  updateCategoryAction,
} from "../actions";

interface CategoryFormProps {
  mode: "create" | "edit";
  initialData?: UpdateCategoryInput & { id: string };
  parentName?: string;
  parentId?: string;
  suggestedOrder?: number;
}

export function CategoryForm({
  mode,
  initialData,
  parentName,
  parentId,
  suggestedOrder = 1,
}: CategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<CreateCategoryInput | UpdateCategoryInput>({
    resolver: zodResolver(mode === "create" ? createCategorySchema : updateCategorySchema) as any,
    defaultValues: {
      name: initialData?.name ?? "",
      slug: initialData?.slug ?? "",
      icon: initialData?.icon ?? null,
      displayOrder: initialData?.displayOrder ?? suggestedOrder,
      status: (initialData?.status ?? "active") as "active" | "inactive",
      parentId: initialData?.parentId ?? parentId ?? null,
    },
  });

  const watchName = form.watch("name");
  const watchSlug = form.watch("slug");

  useEffect(() => {
    if (mode === "create" && watchName) {
      const slug = watchName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      
      form.setValue("slug", slug, { shouldValidate: false });
    }
  }, [watchName, mode, form]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const action =
        mode === "create" ? createCategoryAction : updateCategoryAction;
      const result = await action(
        mode === "edit" ? { ...data, id: initialData?.id } : data
      );

      if (result.success) {
        toast.add({
          type: "success",
          title: "Success",
          description:
            mode === "create"
              ? parentName
                ? `Sub-category created under ${parentName}`
                : "Category created successfully"
              : "Category updated successfully",
        });
        router.push("/staff/business-categories");
        router.refresh();
      } else {
        toast.add({
          type: "error",
          title: "Error",
          description: result.error,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          {...form.register("name")}
          placeholder="Category name"
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          {...form.register("slug")}
          placeholder="category-slug"
          readOnly={mode === "create"}
        />
        {watchSlug && (
          <p className="text-sm text-muted-foreground">
            Preview: /categories/{watchSlug}
          </p>
        )}
        {form.formState.errors.slug && (
          <p className="text-sm text-destructive">
            {form.formState.errors.slug.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Icon</Label>
        <CategoryIconPicker
          value={form.watch("icon") ?? null}
          onChange={(icon) => form.setValue("icon", icon)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="displayOrder">Display Order</Label>
        <Input
          id="displayOrder"
          type="number"
          min={1}
          {...form.register("displayOrder", { valueAsNumber: true })}
        />
        {form.formState.errors.displayOrder && (
          <p className="text-sm text-destructive">
            {form.formState.errors.displayOrder.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <RadioGroup
          value={form.watch("status")}
          onValueChange={(value: "active" | "inactive") =>
            form.setValue("status", value)
          }
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="active" id="active" />
            <Label htmlFor="active">Active</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="inactive" id="inactive" />
            <Label htmlFor="inactive">Inactive</Label>
          </div>
        </RadioGroup>
      </div>

      {parentName && (
        <div className="space-y-2">
          <Label>Parent Category</Label>
          <Input value={parentName} disabled />
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : mode === "create" ? "Create" : "Update"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/staff/business-categories")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
