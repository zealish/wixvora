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
            <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
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
    Store: require("lucide-react").Store,
    ShoppingCart: require("lucide-react").ShoppingCart,
    Package: require("lucide-react").Package,
    Utensils: require("lucide-react").Utensils,
    Coffee: require("lucide-react").Coffee,
    Briefcase: require("lucide-react").Briefcase,
    Wrench: require("lucide-react").Wrench,
    Car: require("lucide-react").Car,
    Home: require("lucide-react").Home,
    Heart: require("lucide-react").Heart,
    BookOpen: require("lucide-react").BookOpen,
    Laptop: require("lucide-react").Laptop,
    Palette: require("lucide-react").Palette,
    Music: require("lucide-react").Music,
    Camera: require("lucide-react").Camera,
    Star: require("lucide-react").Star,
    Zap: require("lucide-react").Zap,
    Globe: require("lucide-react").Globe,
    Shield: require("lucide-react").Shield,
    Users: require("lucide-react").Users,
    FileText: require("lucide-react").FileText,
    Settings: require("lucide-react").Settings,
    LayoutDashboard: require("lucide-react").LayoutDashboard,
    FolderTree: require("lucide-react").FolderTree,
    Tag: require("lucide-react").Tag,
    Gift: require("lucide-react").Gift,
    Truck: require("lucide-react").Truck,
    CreditCard: require("lucide-react").CreditCard,
    BarChart3: require("lucide-react").BarChart3,
    MessageSquare: require("lucide-react").MessageSquare,
    Phone: require("lucide-react").Phone,
    Mail: require("lucide-react").Mail,
    MapPin: require("lucide-react").MapPin,
    Calendar: require("lucide-react").Calendar,
    Clock: require("lucide-react").Clock,
  };

  return icons[iconName] ?? null;
}
