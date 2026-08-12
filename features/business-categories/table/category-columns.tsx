"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  Store,
  ShoppingCart,
  Package,
  Utensils,
  Coffee,
  Briefcase,
  Wrench,
  Car,
  Home,
  Heart,
  BookOpen,
  Laptop,
  Palette,
  Music,
  Camera,
  Star,
  Zap,
  Globe,
  Shield,
  Users,
  FileText,
  Settings,
  LayoutDashboard,
  FolderTree,
  Tag,
  Gift,
  Truck,
  CreditCard,
  BarChart3,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
} from "lucide-react";
import type { CategoryWithChildren } from "../types";
import { DataTableColumnHeader } from "@/components/shared/data-table/column-header";

export function createCategoryColumns(
  expandedIds: Set<string>,
  onToggleExpand: (id: string) => void,
  onEdit: (id: string) => void,
  onDelete: (id: string, hasChildren: boolean) => void,
  onAddSubCategory: (id: string) => void,
  onToggleStatus: (id: string, currentStatus: "active" | "inactive") => void
): ColumnDef<CategoryWithChildren>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={
            table.getIsSomePageRowsSelected() &&
            !table.getIsAllPageRowsSelected()
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      meta: {
        exportable: false,
        visibleFrom: "always",
        minWidth: 40,
        cellClassName: "w-[40px]",
      },
    },
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
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const category = row.original as CategoryWithChildren & {
          depth?: number;
        };
        const IconComponent = getIconComponent(category.icon);
        const depth = category.depth ?? 0;
        const paddingLeft = depth * 24; // 24px per level

        return (
          <div
            className="flex items-center gap-2"
            style={{ paddingLeft: `${paddingLeft}px` }}
          >
            {IconComponent && <IconComponent className="h-4 w-4" />}
            <span
              className={depth > 0 ? "text-muted-foreground" : "font-medium"}
            >
              {category.name}
            </span>
          </div>
        );
      },
      meta: {
        searchable: true,
        exportable: true,
      },
    },
    {
      accessorKey: "slug",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Slug" />
      ),
      cell: ({ row }) => (
        <code className="bg-muted rounded px-1.5 py-0.5 text-sm">
          {row.original.slug}
        </code>
      ),
      meta: {
        searchable: true,
        exportable: true,
        copyable: true,
      },
    },
    {
      accessorKey: "displayOrder",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Order" />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.displayOrder}
        </span>
      ),
      meta: {
        exportable: true,
        align: "center",
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <Badge
          variant={row.original.status === "active" ? "default" : "secondary"}
        >
          {row.original.status}
        </Badge>
      ),
      meta: {
        exportable: true,
        filterVariant: "select",
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const category = row.original;
        const hasChildren = category.children && category.children.length > 0;
        const isRoot = !category.parentId;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="hover:bg-accent hover:text-accent-foreground inline-flex h-8 w-8 items-center justify-center rounded-md">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(category.id)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              {isRoot && (
                <DropdownMenuItem onClick={() => onAddSubCategory(category.id)}>
                  <FolderPlus className="mr-2 h-4 w-4" />
                  Add Sub-Category
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => onToggleStatus(category.id, category.status)}
              >
                {category.status === "active" ? (
                  <ToggleRight className="mr-2 h-4 w-4" />
                ) : (
                  <ToggleLeft className="mr-2 h-4 w-4" />
                )}
                Toggle Status
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(category.id, hasChildren)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      meta: {
        exportable: false,
      },
    },
  ];
}

function getIconComponent(iconName: string | null) {
  if (!iconName) return null;

  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    Store,
    ShoppingCart,
    Package,
    Utensils,
    Coffee,
    Briefcase,
    Wrench,
    Car,
    Home,
    Heart,
    BookOpen,
    Laptop,
    Palette,
    Music,
    Camera,
    Star,
    Zap,
    Globe,
    Shield,
    Users,
    FileText,
    Settings,
    LayoutDashboard,
    FolderTree,
    Tag,
    Gift,
    Truck,
    CreditCard,
    BarChart3,
    MessageSquare,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Clock,
  };

  return icons[iconName] ?? null;
}
