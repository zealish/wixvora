"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Globe, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import type { WebsiteListItem } from "@/features/websites/types";
import { deleteWebsiteAction, toggleWebsitePublishedAction } from "@/features/websites/actions";

interface WebsiteListProps {
  websites: WebsiteListItem[];
}

export default function WebsiteList({ websites }: WebsiteListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this website?")) return;
    setDeletingId(id);
    await deleteWebsiteAction(id);
    window.location.reload();
  };

  const handleTogglePublish = async (id: string, isPublished: boolean) => {
    await toggleWebsitePublishedAction(id, !isPublished);
    window.location.reload();
  };

  if (websites.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center">
        <Globe className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-4 text-lg font-semibold text-slate-900">No websites yet</h3>
        <p className="mt-2 text-sm text-slate-500">
          Get started by creating a new website from a template.
        </p>
        <Link
          href="/dashboard/websites/create"
          className="mt-4 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
        >
          Create Your First Website
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {websites.map((website) => (
        <div
          key={website.id}
          className="group relative rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold text-slate-900">{website.name}</h3>
              {website.description && (
                <p className="text-sm text-slate-500 line-clamp-2">
                  {website.description}
                </p>
              )}
            </div>
            <div className="relative">
              <button className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                website.status === "published"
                  ? "bg-green-50 text-green-700"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {website.status}
            </span>
            <span className="text-xs text-slate-500">
              {format(new Date(website.createdAt), "MMM d, yyyy")}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
            <Link
              href={`/website-editor/${website.id}`}
              className="flex-1 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <Pencil className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Link>
            <button
              onClick={() => handleTogglePublish(website.id, website.isPublished)}
              className={`flex-1 inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium shadow-sm ${
                website.isPublished
                  ? "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                  : "border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
              }`}
            >
              {website.isPublished ? "Unpublish" : "Publish"}
            </button>
            <button
              onClick={() => handleDelete(website.id)}
              disabled={deletingId === website.id}
              className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white p-1.5 text-slate-500 shadow-sm hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
