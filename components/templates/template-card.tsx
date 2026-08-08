"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useState } from "react";

interface TemplateCardProps {
  id: number;
  name: string;
  category: string;
  categoryLabel: string;
  image: string;
  badge?: string | null;
  badgeColor?: string;
  onPreview: (id: number) => void;
  index: number;
}

export function TemplateCard({
  id,
  name,
  categoryLabel,
  image,
  badge,
  badgeColor,
  onPreview,
  index,
}: TemplateCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      onClick={() => onPreview(id)}
      className="group flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_4px_20px_-2px_rgba(15,23,42,0.05),0_2px_6px_-1px_rgba(15,23,42,0.03)] transition-all hover:shadow-[0_20px_25px_-5px_rgba(15,23,42,0.08),0_10px_10px_-5px_rgba(15,23,42,0.03)]"
    >
      <div>
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
          <motion.img
            src={image}
            alt={name}
            className="h-full w-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.5 }}
          />

          {badge && (
            <span
              className={`absolute top-3 right-3 rounded-md px-2.5 py-1 text-[10px] font-extrabold tracking-wider uppercase ${badgeColor}`}
            >
              {badge}
            </span>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-slate-900/30 transition-opacity"
          >
            <motion.span
              initial={{ y: 8 }}
              whileHover={{ y: 0 }}
              className="rounded-xl bg-white/90 px-4 py-2 text-xs font-bold text-slate-900 shadow-lg backdrop-blur"
            >
              Preview Template
            </motion.span>
          </motion.div>
        </div>

        <div className="flex items-center justify-between p-4">
          <div>
            <h4 className="group-hover:text-brand-600 text-base font-bold text-slate-900 transition-colors">
              {name}
            </h4>
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              {categoryLabel}
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorite(!isFavorite);
            }}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-red-500"
          >
            <Heart
              className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`}
            />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
