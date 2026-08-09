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
  | 'footer';

export interface Block {
  id: string;
  type: BlockType;
  hidden: boolean;
  props: any;
  children?: Block[] | undefined;
  // Canvas positioning (optional, default is flow-based layout)
  x?: number;
  y?: number;
}

export interface PageSettings {
  title: string;
  bgColor: string;
  fontFamily: string;
}
