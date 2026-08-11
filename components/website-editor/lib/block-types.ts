export type ElementType = 'heading' | 'paragraph' | 'button' | 'badge' | 'image' | 'card' | 'video';

export type ElementCategory = 'text' | 'interactive' | 'media' | 'layout' | 'navigation' | 'forms';

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

  // Button-specific
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  padding?: string;
  openInNewTab?: boolean;

  // Badge-specific
  badgeVariant?: 'solid' | 'outline' | 'dot';

  // Card-specific
  titleFontSize?: string;
  titleFontWeight?: string;
  titleColor?: string;
  subtitleFontSize?: string;
  subtitleFontWeight?: string;
  subtitleColor?: string;

  // Video-specific
  videoUrl?: string;
  videoProvider?: 'youtube' | 'vimeo' | null;
  autoplay?: boolean;
  loop?: boolean;
  aspectRatio?: '16:9' | '4:3' | '1:1';
  thumbnailUrl?: string;
  playButtonStyle?: 'circle' | 'square' | 'minimal';
  overlayColor?: string;
  muted?: boolean;
  showControls?: boolean;
  controlBarTheme?: 'dark' | 'light';
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
  bgImage?: string;
  bgImageSize?: 'cover' | 'contain' | 'auto';
  bgImagePosition?: string;
  bgImageRepeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
  bgImageOpacity?: number;
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  borderTop?: string;
  borderBottom?: string;
  boxShadow?: string;
  overlay?: {
    enabled: boolean;
    color: string;
    opacity: number;
  };
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
