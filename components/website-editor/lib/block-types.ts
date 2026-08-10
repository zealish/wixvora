export type BlockType =
  | 'navbar'
  | 'hero'
  | 'container'
  | 'grid_custom'
  | 'heading'
  | 'paragraph'
  | 'image'
  | 'pricing'
  | 'form_contact'
  | 'footer'
  | 'button'
  | 'badge'
  | 'card';

export type Viewport = 'desktop' | 'tablet' | 'mobile';

export interface ViewportLayout {
  x: number;
  y: number;
  width: number;
  height: number;
  hidden: boolean;
}

export interface Block {
  id: string;
  type: BlockType;
  hidden: boolean;
  props: any;
  children?: Block[] | undefined;

  // New: per-viewport layouts
  layouts?: {
    desktop: ViewportLayout;
    tablet: ViewportLayout;
    mobile: ViewportLayout;
  };
  zIndex?: number;

  // Legacy positioning (deprecated, used for migration)
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface Section {
  id: string;
  title: string;
  blocks: Block[];
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
