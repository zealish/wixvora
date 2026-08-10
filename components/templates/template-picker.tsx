"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createWebsiteFromTemplateAction } from "@/features/websites/actions";
import type { TemplateListItem } from "@/features/templates/types";

interface TemplatePickerProps {
  templates: TemplateListItem[];
}

export default function TemplatePicker({ templates }: TemplatePickerProps) {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [websiteName, setWebsiteName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!selectedTemplate || !websiteName.trim()) return;

    setIsCreating(true);
    const result = await createWebsiteFromTemplateAction({
      templateId: selectedTemplate,
      name: websiteName.trim(),
    });

    if (result.success && result.data?.id) {
      router.push(`/website-editor/${result.data.id}`);
    } else if (!result.success) {
      alert(result.error || "Failed to create website");
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Website Name
        </label>
        <input
          type="text"
          value={websiteName}
          onChange={(e) => setWebsiteName(e.target.value)}
          placeholder="My Awesome Website"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() => setSelectedTemplate(template.id)}
            className={`group relative cursor-pointer rounded-lg border-2 p-4 transition-all ${
              selectedTemplate === template.id
                ? "border-primary bg-primary/5 shadow-md"
                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
            }`}
          >
            {template.previewImageUrl && (
              <div className="mb-3 aspect-video overflow-hidden rounded-md bg-slate-100">
                <img
                  src={template.previewImageUrl}
                  alt={template.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <h3 className="font-semibold text-slate-900">{template.name}</h3>
            {template.categoryName && (
              <p className="mt-1 text-sm text-slate-500">{template.categoryName}</p>
            )}
            {template.description && (
              <p className="mt-2 text-xs text-slate-600 line-clamp-2">
                {template.description}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleCreate}
          disabled={!selectedTemplate || !websiteName.trim() || isCreating}
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? "Creating..." : "Create Website"}
        </button>
      </div>
    </div>
  );
}
