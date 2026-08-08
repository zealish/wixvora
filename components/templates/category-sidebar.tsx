"use client";

import { motion } from "framer-motion";
import {
  LayoutGrid,
  Briefcase,
  Image,
  ShoppingCart,
  GraduationCap,
  Heart,
  UtensilsCrossed,
  Compass,
  Cpu,
  Calendar,
  User,
  MoreHorizontal,
} from "lucide-react";

const categories = [
  { id: "all", label: "All Templates", icon: LayoutGrid },
  { id: "business", label: "Business", icon: Briefcase },
  { id: "portfolio", label: "Portfolio", icon: Image },
  { id: "ecommerce", label: "E-commerce", icon: ShoppingCart },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "health", label: "Health & Wellness", icon: Heart },
  { id: "restaurant", label: "Restaurant & Food", icon: UtensilsCrossed },
  { id: "travel", label: "Travel & Tourism", icon: Compass },
  { id: "technology", label: "Technology", icon: Cpu },
  { id: "event", label: "Event", icon: Calendar },
  { id: "personal", label: "Personal", icon: User },
  { id: "others", label: "Others", icon: MoreHorizontal },
];

interface CategorySidebarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategorySidebar({
  selectedCategory,
  onCategoryChange,
}: CategorySidebarProps) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-2 lg:col-span-3"
    >
      <div className="space-y-1 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
        {categories.map((category, index) => {
          const Icon = category.icon;
          const isActive = selectedCategory === category.id;

          return (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
              onClick={() => onCategoryChange(category.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
                isActive
                  ? "bg-brand-50 text-brand-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{category.label}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.aside>
  );
}
