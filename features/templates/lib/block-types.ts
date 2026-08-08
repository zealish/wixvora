export interface NavLink {
  label: string;
  url: string;
}

export interface NavbarProps {
  layerName: string;
  logoText: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
  links: NavLink[];
  ctaText: string;
  ctaUrl: string;
}

export interface HeroProps {
  layerName: string;
  badge: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonUrl: string;
  secondaryButtonText: string;
  secondaryButtonUrl: string;
  bgColor: string;
  textColor: string;
  bgGradient: string;
  align: "left" | "center" | "right";
}

export interface ContainerProps {
  layerName: string;
  paddingY: string;
  paddingX: string;
  bgColor: string;
  textColor: string;
  bgGradient: string;
  borderRadius: string;
  borderWidth: string;
  borderColor: string;
  content: string;
}

export interface GridColumn {
  icon: string;
  title: string;
  desc: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
  btnText: string;
  btnUrl: string;
}

export interface GridCustomProps {
  layerName: string;
  title: string;
  subtitle: string;
  columnsCount: number;
  gap: string;
  columns: GridColumn[];
}

export interface HeadingProps {
  layerName: string;
  text: string;
  level: "h1" | "h2" | "h3" | "h4";
  align: "left" | "center" | "right";
  fontSize: string;
  textColor: string;
  weight: string;
  fontFamily: string;
}

export interface ParagraphProps {
  layerName: string;
  text: string;
  align: "left" | "center" | "right";
  fontSize: string;
  textColor: string;
  maxWidth: string;
}

export interface ImageProps {
  layerName: string;
  url: string;
  alt: string;
  caption: string;
  rounded: string;
  shadow: string;
}

export interface PricingProps {
  layerName: string;
  planName: string;
  badge: string;
  price: string;
  period: string;
  bgColor: string;
  accentColor: string;
  textColor: string;
  features: string[];
  buttonText: string;
  buttonUrl: string;
}

export interface FormContactProps {
  layerName: string;
  title: string;
  subtitle: string;
  placeholder: string;
  buttonText: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
}

export interface FooterProps {
  layerName: string;
  brandName: string;
  copyright: string;
  bgColor: string;
  textColor: string;
}

export type BlockType =
  | "navbar"
  | "hero"
  | "container"
  | "grid_custom"
  | "heading"
  | "paragraph"
  | "image"
  | "pricing"
  | "form_contact"
  | "footer";

export type BlockProps =
  | NavbarProps
  | HeroProps
  | ContainerProps
  | GridCustomProps
  | HeadingProps
  | ParagraphProps
  | ImageProps
  | PricingProps
  | FormContactProps
  | FooterProps;

export type BlockConfig =
  | { id: string; type: "navbar"; hidden: boolean; props: NavbarProps }
  | { id: string; type: "hero"; hidden: boolean; props: HeroProps }
  | { id: string; type: "container"; hidden: boolean; props: ContainerProps }
  | { id: string; type: "grid_custom"; hidden: boolean; props: GridCustomProps }
  | { id: string; type: "heading"; hidden: boolean; props: HeadingProps }
  | { id: string; type: "paragraph"; hidden: boolean; props: ParagraphProps }
  | { id: string; type: "image"; hidden: boolean; props: ImageProps }
  | { id: string; type: "pricing"; hidden: boolean; props: PricingProps }
  | { id: string; type: "form_contact"; hidden: boolean; props: FormContactProps }
  | { id: string; type: "footer"; hidden: boolean; props: FooterProps };

export interface PageSettings {
  title: string;
  bgColor: string;
  fontFamily: string;
}

export const DEFAULT_PAGE_SETTINGS: PageSettings = {
  title: "My Website - Wixvora",
  bgColor: "#090d16",
  fontFamily: "font-sans",
};

export function createBlockId(): string {
  return "layer_" + Math.random().toString(36).slice(2, 11);
}

export function gridColsClass(count: number): string {
  const classes = ["", "grid-cols-1", "md:grid-cols-2", "md:grid-cols-3", "md:grid-cols-4"];
  return classes[count] ?? "md:grid-cols-3";
}

export function textAlignClass(align: "left" | "center" | "right"): string {
  return align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";
}

export function justifyAlignClass(align: "left" | "center" | "right"): string {
  return align === "center" ? "justify-center" : align === "right" ? "justify-end" : "justify-start";
}
