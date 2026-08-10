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
      // Save pages array - each section is already an object from editor state
      const result = await updateTemplateSectionsAction(templateId, {
        pages,  // Send raw pages array without double-stringifying
        pageSettings: JSON.stringify(pageSettings),
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
