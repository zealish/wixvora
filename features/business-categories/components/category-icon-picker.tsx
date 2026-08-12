"use client";

import { useState } from "react";
import {
  Search,
  X,
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
  Check,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
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
  Check,
  XIcon,
};

const POPULAR_ICON_NAMES = [
  "Store",
  "ShoppingCart",
  "Package",
  "Utensils",
  "Coffee",
  "Briefcase",
  "Wrench",
  "Car",
  "Home",
  "Heart",
  "BookOpen",
  "Laptop",
  "Palette",
  "Music",
  "Camera",
  "Star",
  "Zap",
  "Globe",
  "Shield",
  "Users",
  "FileText",
  "Settings",
  "LayoutDashboard",
  "FolderTree",
  "Tag",
  "Gift",
  "Truck",
  "CreditCard",
  "BarChart3",
  "MessageSquare",
  "Phone",
  "Mail",
  "MapPin",
  "Calendar",
  "Clock",
];

const ALL_ICON_NAMES = Object.keys(ICON_MAP);

interface CategoryIconPickerProps {
  value: string | null;
  onChange: (icon: string | null) => void;
}

export function CategoryIconPicker({
  value,
  onChange,
}: CategoryIconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredIconNames = search
    ? ALL_ICON_NAMES.filter((name) =>
        name.toLowerCase().includes(search.toLowerCase())
      )
    : POPULAR_ICON_NAMES;

  const SelectedIcon = value ? ICON_MAP[value] : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            type="button"
            className="w-full justify-start gap-2"
          />
        }
      >
        {SelectedIcon ? (
          <>
            <SelectedIcon className="h-4 w-4" />
            {value}
          </>
        ) : (
          "Select icon..."
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Icon</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="grid max-h-80 grid-cols-8 gap-2 overflow-y-auto">
            {filteredIconNames.map((iconName) => {
              const Icon = ICON_MAP[iconName];
              if (!Icon) return null;
              return (
                <Button
                  key={iconName}
                  variant={value === iconName ? "default" : "outline"}
                  size="icon"
                  className="h-10 w-10"
                  type="button"
                  onClick={() => {
                    onChange(iconName);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              );
            })}
          </div>
          {value && (
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => onChange(null)}
              className="gap-1"
            >
              <X className="h-3 w-3" />
              Clear selection
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
