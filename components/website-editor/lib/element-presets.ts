import type { ElementType, ViewportLayout, ElementCategory } from './block-types';

export interface ElementPreset {
  type: ElementType;
  category: ElementCategory;
  label: string;
  icon: string;
  labelKey: string;
  descriptionKey: string;
  defaultProps: Record<string, unknown>;
  defaultLayouts: {
    desktop: ViewportLayout;
    tablet: ViewportLayout;
    mobile: ViewportLayout;
  };
}

export const ELEMENT_PRESETS_BY_CATEGORY: Record<ElementCategory, ElementPreset[]> = {
  text: [
    {
      type: 'heading',
      category: 'text',
      label: 'Heading',
      icon: 'type',
      labelKey: 'element.heading.label',
      descriptionKey: 'element.heading.description',
      defaultProps: {
        name: 'Heading',
        text: 'Responsive Heading Text',
        fontSize: '32px',
        fontWeight: '800',
        textColor: '#0f172a',
        textAlign: 'left',
      },
      defaultLayouts: {
        desktop: { x: 60, y: 40, width: 520, height: 60, hidden: false },
        tablet: { x: 40, y: 30, width: 440, height: 60, hidden: false },
        mobile: { x: 20, y: 20, width: 335, height: 70, hidden: false },
      },
    },
    {
      type: 'paragraph',
      category: 'text',
      label: 'Paragraph',
      icon: 'type',
      labelKey: 'element.paragraph.label',
      descriptionKey: 'element.paragraph.description',
      defaultProps: {
        name: 'Paragraph',
        text: 'Each viewport (Desktop, Tablet, Mobile) has independent X, Y coordinates and sizing.',
        fontSize: '14px',
        fontWeight: '400',
        textColor: '#475569',
        textAlign: 'left',
      },
      defaultLayouts: {
        desktop: { x: 60, y: 110, width: 480, height: 80, hidden: false },
        tablet: { x: 40, y: 100, width: 420, height: 90, hidden: false },
        mobile: { x: 20, y: 100, width: 335, height: 110, hidden: false },
      },
    },
  ],
  interactive: [
    {
      type: 'button',
      category: 'interactive',
      label: 'Button',
      icon: 'move',
      labelKey: 'element.button.label',
      descriptionKey: 'element.button.description',
      defaultProps: {
        name: 'CTA Button',
        text: 'Click / Drag Me',
        url: '#',
        bgColor: '#2563eb',
        textColor: '#ffffff',
        borderRadius: '12px',
        fontSize: '13px',
        fontWeight: '600',
        variant: 'primary',
        size: 'md',
        padding: '12px 24px',
        openInNewTab: false,
      },
      defaultLayouts: {
        desktop: { x: 60, y: 200, width: 180, height: 46, hidden: false },
        tablet: { x: 40, y: 200, width: 180, height: 46, hidden: false },
        mobile: { x: 20, y: 220, width: 335, height: 48, hidden: false },
      },
    },
    {
      type: 'badge',
      category: 'interactive',
      label: 'Badge',
      icon: 'sparkles',
      labelKey: 'element.badge.label',
      descriptionKey: 'element.badge.description',
      defaultProps: {
        name: 'Badge Tag',
        text: 'RESPONSIVE INDEPENDENT DnD',
        bgColor: '#eff6ff',
        textColor: '#2563eb',
        borderColor: '#bfdbfe',
        borderRadius: '9999px',
        fontSize: '11px',
        badgeVariant: 'solid',
      },
      defaultLayouts: {
        desktop: { x: 60, y: 15, width: 220, height: 32, hidden: false },
        tablet: { x: 40, y: 15, width: 200, height: 32, hidden: false },
        mobile: { x: 20, y: 10, width: 200, height: 30, hidden: false },
      },
    },
  ],
  media: [
    {
      type: 'image',
      category: 'media',
      label: 'Image',
      icon: 'image',
      labelKey: 'element.image.label',
      descriptionKey: 'element.image.description',
      defaultProps: {
        name: 'Visual Image',
        url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
        alt: 'Showcase',
        borderRadius: '16px',
        objectFit: 'cover',
      },
      defaultLayouts: {
        desktop: { x: 620, y: 30, width: 280, height: 220, hidden: false },
        tablet: { x: 480, y: 30, width: 240, height: 190, hidden: false },
        mobile: { x: 20, y: 280, width: 335, height: 180, hidden: false },
      },
    },
    {
      type: 'video',
      category: 'media',
      label: 'Video Player',
      icon: 'media',
      labelKey: 'element.video.label',
      descriptionKey: 'element.video.description',
      defaultProps: {
        name: 'Video Player',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        videoProvider: 'youtube',
        autoplay: false,
        loop: false,
        aspectRatio: '16:9',
        borderRadius: '12px',
        playButtonStyle: 'circle',
        overlayColor: 'rgba(0,0,0,0.3)',
      },
      defaultLayouts: {
        desktop: { x: 620, y: 30, width: 400, height: 250, hidden: false },
        tablet: { x: 480, y: 30, width: 320, height: 200, hidden: false },
        mobile: { x: 20, y: 280, width: 335, height: 210, hidden: false },
      },
    },
  ],
  layout: [
    {
      type: 'card',
      category: 'layout',
      label: 'Card',
      icon: 'box',
      labelKey: 'element.card.label',
      descriptionKey: 'element.card.description',
      defaultProps: {
        name: 'Feature Card',
        title: 'Fully Customizable',
        subtitle: 'Each card section and its elements are in an isolated section.',
        bgColor: '#ffffff',
        textColor: '#0f172a',
        borderColor: '#e2e8f0',
        borderRadius: '16px',
        accentColor: '#2563eb',
        titleFontSize: '18px',
        titleFontWeight: '700',
        titleColor: '#2563eb',
        subtitleFontSize: '13px',
        subtitleFontWeight: '400',
        subtitleColor: '#64748b',
      },
      defaultLayouts: {
        desktop: { x: 60, y: 270, width: 300, height: 180, hidden: false },
        tablet: { x: 40, y: 260, width: 280, height: 170, hidden: false },
        mobile: { x: 20, y: 280, width: 335, height: 170, hidden: false },
      },
    },
  ],
  navigation: [],
  forms: [],
};

export const ELEMENT_PRESETS: ElementPreset[] = Object.values(ELEMENT_PRESETS_BY_CATEGORY).flat();
