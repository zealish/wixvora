"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  FolderPlus,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import type { CategoryWithChildren } from "../types";

export function getCategoryColumns(
  expandedIds: Set<string>,
  onToggleExpand: (id: string) => void,
  onEdit: (id: string) => void,
  onDelete: (id: string, hasChildren: boolean) => void,
  onAddSubCategory: (id: string) => void,
  onToggleStatus: (id: string, currentStatus: "active" | "inactive") => void
): ColumnDef<CategoryWithChildren>[] {
  return [
    {
      id: "expand",
      header: "",
      cell: ({ row }) => {
        const category = row.original;
        const hasChildren = category.children && category.children.length > 0;
        const isExpanded = expandedIds.has(category.id);

        return (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => hasChildren && onToggleExpand(category.id)}
            disabled={!hasChildren}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )
            ) : (
              <span className="w-4" />
            )}
          </Button>
        );
      },
      size: 40,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const category = row.original;
        const IconComponent = getIconComponent(category.icon);

        return (
          <div className="flex items-center gap-2">
            {IconComponent && <IconComponent className="h-4 w-4" />}
            <span className={category.parentId ? "pl-4 text-muted-foreground" : "font-medium"}>
              {category.name}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <code className="text-sm bg-muted px-1.5 py-0.5 rounded">
          {row.original.slug}
        </code>
      ),
    },
    {
      accessorKey: "displayOrder",
      header: "Order",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.displayOrder}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "active" ? "default" : "secondary"}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const category = row.original;
        const hasChildren = category.children && category.children.length > 0;
        const isRoot = !category.parentId;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(category.id)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              {isRoot && (
                <DropdownMenuItem onClick={() => onAddSubCategory(category.id)}>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Add Sub-Category
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() =>
                  onToggleStatus(
                    category.id,
                    category.status
                  )
                }
              >
                {category.status === "active" ? (
                  <ToggleRight className="h-4 w-4 mr-2" />
                ) : (
                  <ToggleLeft className="h-4 w-4 mr-2" />
                )}
                Toggle Status
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(category.id, hasChildren)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}

function getIconComponent(iconName: string | null) {
  if (!iconName) return null;

  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    Store: LucideIcons.Store,
    ShoppingCart: LucideIcons.ShoppingCart,
    Package: LucideIcons.Package,
    Utensils: LucideIcons.Utensils,
    Coffee: LucideIcons.Coffee,
    Briefcase: LucideIcons.Briefcase,
    Wrench: LucideIcons.Wrench,
    Car: LucideIcons.Car,
    Home: LucideIcons.Home,
    Heart: LucideIcons.Heart,
    BookOpen: LucideIcons.BookOpen,
    Laptop: LucideIcons.Laptop,
    Palette: LucideIcons.Palette,
    Music: LucideIcons.Music,
    Camera: LucideIcons.Camera,
    Star: LucideIcons.Star,
    Zap: LucideIcons.Zap,
    Globe: LucideIcons.Globe,
    Shield: LucideIcons.Shield,
    Users: LucideIcons.Users,
    FileText: LucideIcons.FileText,
    Settings: LucideIcons.Settings,
    LayoutDashboard: LucideIcons.LayoutDashboard,
    FolderTree: LucideIcons.FolderTree,
    Tag: LucideIcons.Tag,
    Gift: LucideIcons.Gift,
    Truck: LucideIcons.Truck,
    CreditCard: LucideIcons.CreditCard,
    BarChart3: LucideIcons.BarChart3,
    MessageSquare: LucideIcons.MessageSquare,
    Phone: LucideIcons.Phone,
    Mail: LucideIcons.Mail,
    MapPin: LucideIcons.MapPin,
    Calendar: LucideIcons.Calendar,
    Clock: LucideIcons.Clock,
  };

  return icons[iconName] ?? null;
}
