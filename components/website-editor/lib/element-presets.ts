import type { ElementType, ViewportLayout } from './block-types';

export interface ElementPreset {
  type: ElementType;
  label: string;
  icon: string;
  defaultProps: Record<string, unknown>;
  defaultLayouts: {
    desktop: ViewportLayout;
    tablet: ViewportLayout;
    mobile: ViewportLayout;
  };
}

export const ELEMENT_PRESETS: ElementPreset[] = [
  {
    type: 'heading',
    label: 'Judul Utama (Heading)',
    icon: 'type',
    defaultProps: {
      name: 'Judul Utama',
      text: 'Judul Teks Wix Responsive',
      fontSize: '32px',
      fontWeight: '800',
      textColor: '#0f172a',
      textAlign: 'left'
    },
    defaultLayouts: {
      desktop: { x: 60, y: 40, width: 520, height: 60, hidden: false },
      tablet: { x: 40, y: 30, width: 440, height: 60, hidden: false },
      mobile: { x: 20, y: 20, width: 335, height: 70, hidden: false }
    }
  },
  {
    type: 'paragraph',
    label: 'Paragraf Penjelas',
    icon: 'type',
    defaultProps: {
      name: 'Paragraf',
      text: 'Setiap viewport (Desktop, Tablet, Mobile) memiliki koordinat X, Y dan ukuran independen.',
      fontSize: '14px',
      fontWeight: '400',
      textColor: '#475569',
      textAlign: 'left'
    },
    defaultLayouts: {
      desktop: { x: 60, y: 110, width: 480, height: 80, hidden: false },
      tablet: { x: 40, y: 100, width: 420, height: 90, hidden: false },
      mobile: { x: 20, y: 100, width: 335, height: 110, hidden: false }
    }
  },
  {
    type: 'button',
    label: 'Tombol Aksi (CTA)',
    icon: 'move',
    defaultProps: {
      name: 'Tombol CTA',
      text: '🔥 Klik / Geser Saya',
      url: '#',
      bgColor: '#2563eb',
      textColor: '#ffffff',
      borderRadius: '12px',
      fontSize: '13px',
      fontWeight: '600'
    },
    defaultLayouts: {
      desktop: { x: 60, y: 200, width: 180, height: 46, hidden: false },
      tablet: { x: 40, y: 200, width: 180, height: 46, hidden: false },
      mobile: { x: 20, y: 220, width: 335, height: 48, hidden: false }
    }
  },
  {
    type: 'badge',
    label: 'Badge / Tag Tagline',
    icon: 'sparkles',
    defaultProps: {
      name: 'Badge Tag',
      text: '✨ RESPONSIVE INDEPENDENT DnD',
      bgColor: '#eff6ff',
      textColor: '#2563eb',
      borderColor: '#bfdbfe',
      borderRadius: '9999px',
      fontSize: '11px'
    },
    defaultLayouts: {
      desktop: { x: 60, y: 15, width: 220, height: 32, hidden: false },
      tablet: { x: 40, y: 15, width: 200, height: 32, hidden: false },
      mobile: { x: 20, y: 10, width: 200, height: 30, hidden: false }
    }
  },
  {
    type: 'image',
    label: 'Gambar Showcase',
    icon: 'image',
    defaultProps: {
      name: 'Gambar Visual',
      url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      alt: 'Showcase',
      borderRadius: '16px',
      objectFit: 'cover'
    },
    defaultLayouts: {
      desktop: { x: 620, y: 30, width: 280, height: 220, hidden: false },
      tablet: { x: 480, y: 30, width: 240, height: 190, hidden: false },
      mobile: { x: 20, y: 280, width: 335, height: 180, hidden: false }
    }
  },
  {
    type: 'card',
    label: 'Kartu Box Fitur',
    icon: 'box',
    defaultProps: {
      name: 'Kartu Fitur',
      title: 'Bebas Kustom',
      subtitle: 'Setiap bagian kartu dan elemen di dalamnya berada dalam seksi terisolasi.',
      bgColor: '#ffffff',
      textColor: '#0f172a',
      borderColor: '#e2e8f0',
      borderRadius: '16px',
      accentColor: '#2563eb'
    },
    defaultLayouts: {
      desktop: { x: 60, y: 270, width: 300, height: 180, hidden: false },
      tablet: { x: 40, y: 260, width: 280, height: 170, hidden: false },
      mobile: { x: 20, y: 280, width: 335, height: 170, hidden: false }
    }
  }
];
