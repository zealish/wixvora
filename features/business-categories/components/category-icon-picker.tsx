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

const POPULAR_ICONS = [
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
];

const ALL_ICONS = [
  ...POPULAR_ICONS,
  Check,
  XIcon,
];

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

  const SelectedIcon = value
    ? ALL_ICONS.find((icon) => icon.displayName === value)
    : null;

  const filteredIcons = search
    ? ALL_ICONS.filter((icon) =>
        icon.displayName?.toLowerCase().includes(search.toLowerCase())
      )
    : POPULAR_ICONS;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" type="button" className="w-full justify-start gap-2" />
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="grid grid-cols-8 gap-2 max-h-80 overflow-y-auto">
            {filteredIcons.map((Icon) => (
              <Button
                key={Icon.displayName}
                variant={value === Icon.displayName ? "default" : "outline"}
                size="icon"
                className="h-10 w-10"
                type="button"
                onClick={() => {
                  onChange(Icon.displayName ?? null);
                  setOpen(false);
                  setSearch("");
                }}
              >
                <Icon className="h-4 w-4" />
              </Button>
            ))}
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
