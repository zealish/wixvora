"use client";

import { useState, useMemo, useEffect } from "react";
import { Monitor, Tablet, Smartphone, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { generateFullHTML } from "@/components/website-editor/lib/html-generator";
import type { Page } from "@/components/website-editor/lib/block-types";

type Viewport = "desktop" | "tablet" | "mobile";

const VIEWPORT_WIDTHS: Record<Viewport, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

interface LivePreviewRendererProps {
  initialPageSlug?: string | undefined;
  name: string;
  pages: Page[];
  source: "template" | "website";
}

export function LivePreviewRenderer({
  initialPageSlug,
  name,
  pages,
  source,
}: LivePreviewRendererProps): React.JSX.Element {
  const router = useRouter();
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [currentPageSlug, setCurrentPageSlug] = useState<string | null>(
    initialPageSlug || null
  );

  const sortedPages = useMemo(
    () => [...pages].sort((a, b) => a.sortOrder - b.sortOrder),
    [pages]
  );

  const currentPage = useMemo(() => {
    if (currentPageSlug) {
      const found = sortedPages.find((p) => p.slug === currentPageSlug);
      if (found) return found;
    }
    return sortedPages.find((p) => p.isHomePage) || sortedPages[0];
  }, [currentPageSlug, sortedPages]);

  const html = useMemo(() => {
    const sections = currentPage?.sections || [];
    return generateFullHTML(Array.isArray(sections) ? sections : []);
  }, [currentPage]);

  useEffect(() => {
    if (initialPageSlug && initialPageSlug !== currentPageSlug) {
      setCurrentPageSlug(initialPageSlug);
    }
  }, [initialPageSlug]);

  const handlePageChange = (slug: string): void => {
    setCurrentPageSlug(slug);
  };

  const handleBack = (): void => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleBack}
              className="mr-1"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">P</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800">{name}</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                {source} preview
              </p>
            </div>
          </div>

          {/* Viewport Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            {(["desktop", "tablet", "mobile"] as Viewport[]).map((vp) => (
              <button
                key={vp}
                onClick={() => setViewport(vp)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                  viewport === vp
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {vp === "desktop" && <Monitor className="w-3.5 h-3.5" />}
                {vp === "tablet" && <Tablet className="w-3.5 h-3.5" />}
                {vp === "mobile" && <Smartphone className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline capitalize">{vp}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Page Navigation */}
        {sortedPages.length > 1 && (
          <div className="max-w-7xl mx-auto px-4 pb-3">
            <div className="flex items-center gap-1 overflow-x-auto">
              {sortedPages.map((page) => {
                const isActive =
                  currentPageSlug === page.slug ||
                  (!currentPageSlug && page.isHomePage);
                return (
                  <button
                    key={page.id}
                    onClick={() => handlePageChange(page.slug)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition ${
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : "text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {page.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Iframe Container */}
      <div className="flex justify-center p-4">
        <div
          style={{ width: VIEWPORT_WIDTHS[viewport] }}
          className="transition-all duration-300 bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200"
        >
          <iframe
            srcDoc={html}
            className="w-full border-0"
            style={{ height: "calc(100vh - 140px)" }}
            title="Preview"
          />
        </div>
      </div>
    </div>
  );
}
