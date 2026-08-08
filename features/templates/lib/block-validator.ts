import { z } from "zod";

const linkSchema = z.object({
  label: z.string(),
  url: z.string(),
});

const gridColumnSchema = z.object({
  icon: z.string(),
  title: z.string(),
  desc: z.string(),
  bgColor: z.string(),
  textColor: z.string(),
  accentColor: z.string(),
  btnText: z.string(),
  btnUrl: z.string(),
});

const navbarPropsSchema = z.object({
  layerName: z.string(),
  logoText: z.string(),
  bgColor: z.string(),
  textColor: z.string(),
  accentColor: z.string(),
  links: z.array(linkSchema),
  ctaText: z.string(),
  ctaUrl: z.string(),
});

const heroPropsSchema = z.object({
  layerName: z.string(),
  badge: z.string(),
  title: z.string(),
  subtitle: z.string(),
  buttonText: z.string(),
  buttonUrl: z.string(),
  secondaryButtonText: z.string(),
  secondaryButtonUrl: z.string(),
  bgColor: z.string(),
  textColor: z.string(),
  bgGradient: z.string(),
  align: z.enum(["left", "center", "right"]),
});

const containerPropsSchema = z.object({
  layerName: z.string(),
  paddingY: z.string(),
  paddingX: z.string(),
  bgColor: z.string(),
  textColor: z.string(),
  bgGradient: z.string(),
  borderRadius: z.string(),
  borderWidth: z.string(),
  borderColor: z.string(),
  content: z.string(),
});

const gridCustomPropsSchema = z.object({
  layerName: z.string(),
  title: z.string(),
  subtitle: z.string(),
  columnsCount: z.number().int().min(1).max(4),
  gap: z.string(),
  columns: z.array(gridColumnSchema),
});

const headingPropsSchema = z.object({
  layerName: z.string(),
  text: z.string(),
  level: z.enum(["h1", "h2", "h3", "h4"]),
  align: z.enum(["left", "center", "right"]),
  fontSize: z.string(),
  textColor: z.string(),
  weight: z.string(),
  fontFamily: z.string(),
});

const paragraphPropsSchema = z.object({
  layerName: z.string(),
  text: z.string(),
  align: z.enum(["left", "center", "right"]),
  fontSize: z.string(),
  textColor: z.string(),
  maxWidth: z.string(),
});

const imagePropsSchema = z.object({
  layerName: z.string(),
  url: z.string(),
  alt: z.string(),
  caption: z.string(),
  rounded: z.string(),
  shadow: z.string(),
});

const pricingPropsSchema = z.object({
  layerName: z.string(),
  planName: z.string(),
  badge: z.string(),
  price: z.string(),
  period: z.string(),
  bgColor: z.string(),
  accentColor: z.string(),
  textColor: z.string(),
  features: z.array(z.string()),
  buttonText: z.string(),
  buttonUrl: z.string(),
});

const formContactPropsSchema = z.object({
  layerName: z.string(),
  title: z.string(),
  subtitle: z.string(),
  placeholder: z.string(),
  buttonText: z.string(),
  bgColor: z.string(),
  textColor: z.string(),
  accentColor: z.string(),
});

const footerPropsSchema = z.object({
  layerName: z.string(),
  brandName: z.string(),
  copyright: z.string(),
  bgColor: z.string(),
  textColor: z.string(),
});

const baseBlock = {
  id: z.string(),
  hidden: z.boolean(),
};

export const blockConfigSchema = z.discriminatedUnion("type", [
  z.object({ ...baseBlock, type: z.literal("navbar"), props: navbarPropsSchema }),
  z.object({ ...baseBlock, type: z.literal("hero"), props: heroPropsSchema }),
  z.object({ ...baseBlock, type: z.literal("container"), props: containerPropsSchema }),
  z.object({ ...baseBlock, type: z.literal("grid_custom"), props: gridCustomPropsSchema }),
  z.object({ ...baseBlock, type: z.literal("heading"), props: headingPropsSchema }),
  z.object({ ...baseBlock, type: z.literal("paragraph"), props: paragraphPropsSchema }),
  z.object({ ...baseBlock, type: z.literal("image"), props: imagePropsSchema }),
  z.object({ ...baseBlock, type: z.literal("pricing"), props: pricingPropsSchema }),
  z.object({ ...baseBlock, type: z.literal("form_contact"), props: formContactPropsSchema }),
  z.object({ ...baseBlock, type: z.literal("footer"), props: footerPropsSchema }),
]);

export const pageSettingsSchema = z.object({
  title: z.string(),
  bgColor: z.string(),
  fontFamily: z.string(),
});
