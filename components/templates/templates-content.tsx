"use client";

import { useState, useMemo } from "react";
import { CategorySidebar } from "./category-sidebar";
import { FilterBar } from "./filter-bar";
import { TemplateGrid, type Template } from "./template-grid";
import { Pagination } from "./pagination";
import { PreviewModal } from "./preview-modal";

const templatesData: Template[] = [
  {
    id: 1,
    name: "Brandix",
    category: "business",
    categoryLabel: "Digital Agency",
    type: "new",
    badge: "NEW",
    badgeColor: "bg-indigo-600 text-white",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
    popularScore: 98,
  },
  {
    id: 2,
    name: "Greenify",
    category: "personal",
    categoryLabel: "Sustainability",
    type: "popular",
    badge: null,
    image: "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80",
    popularScore: 92,
  },
  {
    id: 3,
    name: "Creative Studio",
    category: "portfolio",
    categoryLabel: "Portfolio",
    type: "popular",
    badge: null,
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80",
    popularScore: 89,
  },
  {
    id: 4,
    name: "Shopera",
    category: "ecommerce",
    categoryLabel: "E-commerce",
    type: "premium",
    badge: "PREMIUM",
    badgeColor: "bg-amber-100 text-amber-700",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    popularScore: 95,
  },
  {
    id: 5,
    name: "EduSmart",
    category: "education",
    categoryLabel: "Education",
    type: "new",
    badge: "NEW",
    badgeColor: "bg-indigo-600 text-white",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80",
    popularScore: 87,
  },
  {
    id: 6,
    name: "FitLife",
    category: "health",
    categoryLabel: "Health & Wellness",
    type: "premium",
    badge: "PREMIUM",
    badgeColor: "bg-amber-100 text-amber-700",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80",
    popularScore: 91,
  },
  {
    id: 7,
    name: "TasteHub",
    category: "restaurant",
    categoryLabel: "Restaurant",
    type: "new",
    badge: "NEW",
    badgeColor: "bg-indigo-600 text-white",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80",
    popularScore: 84,
  },
  {
    id: 8,
    name: "Wanderly",
    category: "travel",
    categoryLabel: "Travel & Tourism",
    type: "premium",
    badge: "PREMIUM",
    badgeColor: "bg-amber-100 text-amber-700",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80",
    popularScore: 94,
  },
  {
    id: 9,
    name: "TechNova",
    category: "technology",
    categoryLabel: "Technology",
    type: "new",
    badge: "NEW",
    badgeColor: "bg-indigo-600 text-white",
    image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=600&q=80",
    popularScore: 90,
  },
  {
    id: 10,
    name: "Evently",
    category: "event",
    categoryLabel: "Event",
    type: "premium",
    badge: "PREMIUM",
    badgeColor: "bg-amber-100 text-amber-700",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80",
    popularScore: 88,
  },
  {
    id: 11,
    name: "Writer",
    category: "personal",
    categoryLabel: "Personal Blog",
    type: "free",
    badge: "FREE",
    badgeColor: "bg-sky-100 text-sky-700",
    image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=600&q=80",
    popularScore: 85,
  },
  {
    id: 12,
    name: "Crafted",
    category: "ecommerce",
    categoryLabel: "Handmade Shop",
    type: "premium",
    badge: "PREMIUM",
    badgeColor: "bg-amber-100 text-amber-700",
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=600&q=80",
    popularScore: 93,
  },
];

export function TemplatesContent() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [currentPage, setCurrentPage] = useState(1);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const itemsPerPage = 9;

  const filteredTemplates = useMemo(() => {
    let filtered = templatesData.filter((template) => {
      const matchCategory = selectedCategory === "all" || template.category === selectedCategory;
      const matchFilter = selectedFilter === "all" || template.type === selectedFilter;
      return matchCategory && matchFilter;
    });

    if (sortBy === "popular") {
      filtered.sort((a, b) => b.popularScore - a.popularScore);
    } else if (sortBy === "newest") {
      filtered.sort((a, b) => b.id - a.id);
    } else if (sortBy === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [selectedCategory, selectedFilter, sortBy]);

  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  const paginatedTemplates = filteredTemplates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePreview = (id: number) => {
    const template = templatesData.find((t) => t.id === id);
    if (template) {
      setPreviewTemplate(template);
      setIsModalOpen(true);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    setCurrentPage(1);
  };

  return (
    <>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <CategorySidebar
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />

          <section className="space-y-6 lg:col-span-9">
            <FilterBar
              selectedFilter={selectedFilter}
              onFilterChange={handleFilterChange}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />

            <TemplateGrid templates={paginatedTemplates} onPreview={handlePreview} />

            {filteredTemplates.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </section>
        </div>
      </main>

      <PreviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        template={previewTemplate}
      />
    </>
  );
}
