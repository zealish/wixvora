"use client";

import { useCallback } from "react";
import WebsiteEditor from ".";
import { updateTemplateSectionsAction } from "@/features/templates/actions";
import type { Page, PageSettings } from "./lib/block-types";

interface TemplateEditorWrapperProps {
  templateId: string;
  templateName: string;
  initialPages: Page[];
}

export default function TemplateEditorWrapper({
  templateId,
  templateName,
  initialPages,
}: TemplateEditorWrapperProps) {
  const handleSave = useCallback(
    async (pages: Page[], pageSettings: PageSettings) => {
      const result = await updateTemplateSectionsAction(templateId, {
        sections: pages.flatMap(p => p.sections),
        pageSettings,
      });
      if (!result.success) {
        throw new Error(result.error);
      }
    },
    [templateId]
  );

  return (
    <WebsiteEditor
      initialPages={initialPages}
      onSave={handleSave}
      backUrl="/staff/templates"
      title={`Edit Template: ${templateName}`}
    />
  );
}
