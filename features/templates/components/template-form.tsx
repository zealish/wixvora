"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CategoryWithChildren } from "@/features/business-categories/types";
import type { Template } from "../types";
import { createTemplateAction, updateTemplateAction } from "../actions";

interface TemplateFormProps {
  mode: "create" | "edit";
  categories: CategoryWithChildren[];
  initialData?: Template;
}

interface BasicValues {
  name: string;
  description: string;
  previewImageUrl: string;
  categoryId: string;
  isFeatured: boolean;
  sortOrder: string;
}

export function TemplateForm({
  mode,
  categories,
  initialData,
}: TemplateFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, setValue } = useForm<BasicValues>({
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      previewImageUrl: initialData?.previewImageUrl ?? "",
      categoryId: initialData?.categoryId ?? "",
      isFeatured: initialData?.isFeatured ?? false,
      sortOrder: String(initialData?.sortOrder ?? 0),
    },
  });

  const persist = useCallback(
    async (values: BasicValues, status: "draft" | "published") => {
      const payload = {
        name: values.name,
        description: values.description.trim() || null,
        previewImageUrl: values.previewImageUrl.trim() || null,
        categoryId: values.categoryId ? values.categoryId : null,
        sections: [], // Empty sections - use full-page editor for block editing
        pageSettings: { title: 'My Website', bgColor: '#ffffff', fontFamily: 'font-sans' },
        isFeatured: values.isFeatured,
        sortOrder: Number(values.sortOrder) || 0,
        status,
      };

      setSubmitting(true);
      try {
        const result =
          mode === "create"
            ? await createTemplateAction(payload)
            : initialData
              ? await updateTemplateAction({ ...payload, id: initialData.id })
              : await createTemplateAction(payload);

        if (!result.success) {
          toast.add({
            type: "error",
            title: "Error",
            description: result.error,
          });
          return;
        }

        toast.add({
          type: "success",
          title: "Success",
          description:
            status === "published" ? "Template published" : "Template saved",
        });

        // Redirect to the full-page editor after creation
        const target =
          mode === "create" && result.data?.id
            ? `/templates-editor/${result.data.id}`
            : "/staff/templates";
        router.push(target);
        router.refresh();
      } finally {
        setSubmitting(false);
      }
    },
    [mode, initialData, router]
  );

  const onSaveDraft = handleSubmit((values) => persist(values, "draft"));
  const onSavePublished = handleSubmit((values) =>
    persist(values, "published")
  );

  const categoryOptions = categories.flatMap((cat) => [
    { value: cat.id, label: cat.name, indent: false },
    ...cat.children.map((child) => ({
      value: child.id,
      label: child.name,
      indent: true,
    })),
  ]);

  return (
    <form onSubmit={onSaveDraft} className="space-y-6">
      <div className="bg-card grid gap-4 rounded-lg border p-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            required
            placeholder="Template name"
            {...register("name")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="previewImageUrl">Preview Image URL</Label>
          <Input
            id="previewImageUrl"
            placeholder="https://..."
            {...register("previewImageUrl")}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={2}
            placeholder="Short description of this template"
            {...register("description")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoryId">Business Category</Label>
          <select
            id="categoryId"
            className="border-input focus-visible:ring-ring block w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none"
            {...register("categoryId")}
          >
            <option value="">No category</option>
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.indent ? "\u00A0\u00A0\u21B3 " : ""}
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input
            id="sortOrder"
            type="number"
            min={0}
            {...register("sortOrder")}
          />
        </div>

        <div className="flex items-center space-x-2 md:col-span-2">
          <Checkbox
            id="isFeatured"
            onCheckedChange={(checked) =>
              setValue("isFeatured", checked === true)
            }
          />
          <Label htmlFor="isFeatured">Feature this template</Label>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Save as Draft"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={submitting}
          onClick={() => onSavePublished()}
        >
          Save &amp; Publish
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/staff/templates")}
        >
          Cancel
        </Button>
      </div>
      
      {mode === "create" && (
        <p className="text-sm text-muted-foreground">
          💡 After saving, you&apos;ll be redirected to the full-page block editor to design your template layout.
        </p>
      )}
    </form>
  );
}
