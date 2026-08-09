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
}

export interface PageSettings {
  title: string;
  bgColor: string;
  fontFamily: string;
}
