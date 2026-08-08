import {
  Box,
  Layout,
  Type,
  Image,
  Grid,
  Star,
  Mail,
  Sparkles,
  Layers,
  Palette,
  Code,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  box: Box,
  layout: Layout,
  type: Type,
  image: Image,
  grid: Grid,
  star: Star,
  mail: Mail,
  sparkles: Sparkles,
  layers: Layers,
  palette: Palette,
  code: Code,
};

export function getBlockIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Sparkles;
}
