export type ElementType = 'heading' | 'paragraph' | 'button' | 'badge' | 'image' | 'card';

export type Viewport = 'desktop' | 'tablet' | 'mobile';

export interface ViewportLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  hidden: boolean;
}

export interface Element {
  id: string;
  type: ElementType;
  name: string;
  layouts: {
    desktop: ViewportLayout;
    tablet: ViewportLayout;
    mobile: ViewportLayout;
  };
  zIndex: number;

  // Content props (flat on element)
  text?: string;
  title?: string;
  subtitle?: string;
  url?: string;
  alt?: string;
  fontSize?: string;
  fontWeight?: string;
  textColor?: string;
  bgColor?: string;
  borderColor?: string;
  borderRadius?: string;
  accentColor?: string;
  textAlign?: string;
  objectFit?: string;
}

export interface Section {
  id: string;
  title: string;
  elements: Element[];
  heights: {
    desktop: number;
    tablet: number;
    mobile: number;
  };
  bgColor: string;
  bgGradient?: string;
}

export interface PageSettings {
  title: string;
  bgColor: string;
  fontFamily: string;
}

export interface NavigationSettings {
  layout: 'horizontal' | 'vertical' | 'hamburger';
  position: 'top' | 'left' | 'right';
  bgColor: string;
  textColor: string;
  activeColor: string;
  logo?: string;
  showLogo: boolean;
  showCTAButton: boolean;
  ctaText: string;
  ctaUrl: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  sections: Section[];
  pageSettings: PageSettings;
  isHomePage: boolean;
  sortOrder: number;
  navigationSettings?: NavigationSettings;
}
