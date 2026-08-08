import type {
  BlockConfig,
  BlockType,
  BlockProps,
  NavbarProps,
  HeroProps,
} from "./block-types";
import { createBlockId } from "./block-types";

export interface BlockCatalogItem {
  type: BlockType;
  label: string;
  icon: string;
  defaultProps: BlockProps;
}

export interface BlockCatalogCategory {
  category: string;
  items: BlockCatalogItem[];
}

export const BLOCK_CATALOG: BlockCatalogCategory[] = [
  {
    category: "Container & Section",
    items: [
      {
        type: "container",
        label: "Section Layer (Container)",
        icon: "box",
        defaultProps: {
          layerName: "Custom Main Section",
          paddingY: "py-12",
          paddingX: "px-6",
          bgColor: "#0f172a",
          textColor: "#f8fafc",
          bgGradient: "",
          borderRadius: "rounded-2xl",
          borderWidth: "border-0",
          borderColor: "#334155",
          content:
            "Custom container area. You can add headings, paragraphs, and elements inside.",
        },
      },
      {
        type: "navbar",
        label: "Navigation Bar (Header)",
        icon: "layout",
        defaultProps: {
          layerName: "Navigation Header",
          logoText: "Brand Name",
          bgColor: "#090d16",
          textColor: "#ffffff",
          accentColor: "#2563eb",
          links: [
            { label: "Home", url: "#" },
            { label: "Features", url: "#" },
            { label: "Pricing", url: "#" },
            { label: "Contact", url: "#" },
          ],
          ctaText: "Get Started",
          ctaUrl: "#",
        },
      },
    ],
  },
  {
    category: "Text & Media",
    items: [
      {
        type: "heading",
        label: "Main Heading",
        icon: "type",
        defaultProps: {
          layerName: "Heading Text",
          text: "Design the Future of Your Website",
          level: "h1",
          align: "center",
          fontSize: "text-4xl md:text-5xl",
          textColor: "#ffffff",
          weight: "font-extrabold",
          fontFamily: "font-sans",
        },
      },
      {
        type: "paragraph",
        label: "Paragraph Text",
        icon: "type",
        defaultProps: {
          layerName: "Description Paragraph",
          text: "An interactive website building platform that gives you full flexibility to adjust layout, colors, and styles in real-time.",
          align: "center",
          fontSize: "text-base md:text-lg",
          textColor: "#cbd5e1",
          maxWidth: "max-w-2xl",
        },
      },
      {
        type: "image",
        label: "Image & Media",
        icon: "image",
        defaultProps: {
          layerName: "Visual Image",
          url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
          alt: "Analytics Dashboard",
          caption: "All-purpose analytics management interface",
          rounded: "rounded-2xl",
          shadow: "shadow-2xl shadow-blue-500/10",
        },
      },
    ],
  },
  {
    category: "Grid & Flexible Layout",
    items: [
      {
        type: "grid_custom",
        label: "Custom Column Grid (Features)",
        icon: "grid",
        defaultProps: {
          layerName: "Interactive Features Grid",
          title: "Advantages of Our Product",
          subtitle: "Customize every column fully according to your needs",
          columnsCount: 3,
          gap: "gap-6",
          columns: [
            {
              icon: "sparkles",
              title: "Lightning Performance",
              desc: "Loaded at high speed without heavy library dependencies.",
              bgColor: "#1e293b",
              textColor: "#f8fafc",
              accentColor: "#3b82f6",
              btnText: "Learn More",
              btnUrl: "#",
            },
            {
              icon: "palette",
              title: "Custom Colors",
              desc: "Set custom Hex/RGB colors for each card separately.",
              bgColor: "#0f172a",
              textColor: "#f8fafc",
              accentColor: "#10b981",
              btnText: "Try Colors",
              btnUrl: "#",
            },
            {
              icon: "code",
              title: "Clean Export",
              desc: "Get pure HTML5 & Tailwind CSS results anytime.",
              bgColor: "#18181b",
              textColor: "#f8fafc",
              accentColor: "#f59e0b",
              btnText: "Download Code",
              btnUrl: "#",
            },
          ],
        },
      },
      {
        type: "hero",
        label: "Premium Hero Banner",
        icon: "layout",
        defaultProps: {
          layerName: "Hero Section",
          badge: "Version 3.0 Released",
          title: "Create Your Dream Website Without Limits",
          subtitle:
            "Turn your business idea into a real display visually with the flexibility of a modern block editor.",
          buttonText: "Start Free Trial",
          buttonUrl: "#",
          secondaryButtonText: "View Live Demo",
          secondaryButtonUrl: "#",
          bgColor: "#090d16",
          textColor: "#ffffff",
          bgGradient:
            "bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950",
          align: "center",
        },
      },
    ],
  },
  {
    category: "Marketing & Contact",
    items: [
      {
        type: "pricing",
        label: "Pro Pricing Table",
        icon: "star",
        defaultProps: {
          layerName: "Pricing Table",
          badge: "Recommended",
          planName: "Pro Builder Plan",
          price: "Rp 199.000",
          period: "/month",
          bgColor: "#0f172a",
          accentColor: "#2563eb",
          textColor: "#ffffff",
          features: [
            "Unlimited Block Components",
            "Hex & Gradient Color Customization",
            "Export HTML & JSON Code",
            "24/7 Priority Support",
          ],
          buttonText: "Choose Pro Plan",
          buttonUrl: "#",
        },
      },
      {
        type: "form_contact",
        label: "Contact / Opt-in Form",
        icon: "mail",
        defaultProps: {
          layerName: "Contact Form",
          title: "Subscribe to Our Newsletter",
          subtitle:
            "Get design tips and feature updates straight to your email.",
          placeholder: "Enter your email address...",
          buttonText: "Subscribe Now",
          bgColor: "#1e293b",
          textColor: "#ffffff",
          accentColor: "#2563eb",
        },
      },
      {
        type: "footer",
        label: "Site Footer",
        icon: "layout",
        defaultProps: {
          layerName: "Footer",
          brandName: "Brand Name",
          copyright: "© 2026 Brand Name Inc. All rights reserved.",
          bgColor: "#030712",
          textColor: "#94a3b8",
        },
      },
    ],
  },
];

const saasNavbar: BlockConfig = {
  id: createBlockId(),
  type: "navbar",
  hidden: false,
  props: {
    layerName: "Main Navbar",
    logoText: "WebCraft Pro",
    bgColor: "#090d16",
    textColor: "#ffffff",
    accentColor: "#2563eb",
    links: [
      { label: "Features", url: "#" },
      { label: "Pricing", url: "#" },
      { label: "Documentation", url: "#" },
    ],
    ctaText: "Sign Up Free",
    ctaUrl: "#",
  } as NavbarProps,
};

const saasHero: BlockConfig = {
  id: createBlockId(),
  type: "hero",
  hidden: false,
  props: {
    layerName: "Hero SaaS",
    badge: "Block Builder Re-imagined",
    title: "The Best Visual Block Builder for Modern Teams",
    subtitle:
      "Design, customize colors, and arrange the structure of responsive site pages in minutes.",
    buttonText: "Start Free",
    buttonUrl: "#",
    secondaryButtonText: "View Demo",
    secondaryButtonUrl: "#",
    bgColor: "#090d16",
    textColor: "#ffffff",
    bgGradient: "bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950",
    align: "center",
  } as HeroProps,
};

const saasGrid: BlockConfig = {
  id: createBlockId(),
  type: "grid_custom",
  hidden: false,
  props: {
    layerName: "Features Grid",
    title: "Flexible Key Features",
    subtitle:
      "Each column is fully customizable to match your visual preferences",
    columnsCount: 3,
    gap: "gap-6",
    columns: [
      {
        icon: "grid",
        title: "Dynamic Column Grid",
        desc: "Arrange 1 to 4 columns with independent background styles.",
        bgColor: "#1e293b",
        textColor: "#f8fafc",
        accentColor: "#3b82f6",
        btnText: "Details",
        btnUrl: "#",
      },
      {
        icon: "palette",
        title: "Custom Hex Colors",
        desc: "Full color control for backgrounds, text, and borders per element.",
        bgColor: "#0f172a",
        textColor: "#f8fafc",
        accentColor: "#10b981",
        btnText: "Try",
        btnUrl: "#",
      },
      {
        icon: "layers",
        title: "Clean Layer Tree",
        desc: "Manage layer order and names with an intuitive sidebar.",
        bgColor: "#18181b",
        textColor: "#f8fafc",
        accentColor: "#f59e0b",
        btnText: "Manage",
        btnUrl: "#",
      },
    ],
  },
};

const saasFooter: BlockConfig = {
  id: createBlockId(),
  type: "footer",
  hidden: false,
  props: {
    layerName: "Footer",
    brandName: "WebCraft Studio Pro",
    copyright: "© 2026 WebCraft Studio. Built with limitless flexibility.",
    bgColor: "#030712",
    textColor: "#94a3b8",
  },
};

export const PRESET_TEMPLATES: Record<string, BlockConfig[]> = {
  saas: [saasNavbar, saasHero, saasGrid, saasFooter],
};

export function createBlockFromCatalog(item: BlockCatalogItem): BlockConfig {
  return {
    id: createBlockId(),
    type: item.type,
    hidden: false,
    props: JSON.parse(JSON.stringify(item.defaultProps)) as BlockProps,
  } as BlockConfig;
}
