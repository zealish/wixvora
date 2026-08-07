"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const filterTypes = [
  { id: "all", label: "All" },
  { id: "popular", label: "Popular" },
  { id: "new", label: "New" },
  { id: "free", label: "Free" },
  { id: "premium", label: "Premium" },
];

interface FilterBarProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export function FilterBar({ selectedFilter, onFilterChange, sortBy, onSortChange }: FilterBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-start justify-between gap-4 pb-2 sm:flex-row sm:items-center"
    >
      <div className="flex flex-wrap items-center gap-2">
        {filterTypes.map((filter, index) => {
          const isActive = selectedFilter === filter.id;
          
          return (
            <motion.button
              key={filter.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onFilterChange(filter.id)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all sm:text-sm ${
                isActive
                  ? "bg-brand-600 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {filter.label}
            </motion.button>
          );
        })}
      </div>

      <div className="relative flex items-center">
        <select
          id="sortSelect"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2 pr-9 text-xs font-semibold text-slate-700 shadow-sm focus:border-brand-500 focus:outline-none sm:text-sm cursor-pointer"
        >
          <option value="popular">Sort by: Popular</option>
          <option value="newest">Sort by: Newest</option>
          <option value="name">Sort by: Name</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-slate-400" />
      </div>
    </motion.div>
  );
}
