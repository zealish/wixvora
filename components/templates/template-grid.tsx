"use client";

import { motion } from "framer-motion";
import { SearchX } from "lucide-react";
import { TemplateCard } from "./template-card";

export interface Template {
  id: number;
  name: string;
  category: string;
  categoryLabel: string;
  type: string;
  badge?: string | null;
  badgeColor?: string;
  image: string;
  popularScore: number;
}

interface TemplateGridProps {
  templates: Template[];
  onPreview: (id: number) => void;
}

export function TemplateGrid({ templates, onPreview }: TemplateGridProps) {
  if (templates.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="col-span-full py-12 text-center text-slate-400"
      >
        <SearchX className="mx-auto mb-3 h-12 w-12 stroke-1 text-slate-300" />
        <p className="text-base font-semibold text-slate-600">
          No templates found matching your criteria
        </p>
        <p className="mt-1 text-sm text-slate-400">
          Try resetting filters or searching with different keywords.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {templates.map((template, index) => (
        <TemplateCard
          key={template.id}
          {...template}
          onPreview={onPreview}
          index={index}
        />
      ))}
    </div>
  );
}
