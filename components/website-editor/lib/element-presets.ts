import type { BlockType, ViewportLayout } from './block-types';

export interface ElementPreset {
  type: BlockType;
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
      layerName: 'Judul Teks',
      text: 'Desain Masa Depan Web Anda',
      level: 'h1',
      align: 'center',
      fontSize: 'text-4xl md:text-5xl',
      textColor: '#0f172a',
      weight: 'font-extrabold',
      fontFamily: 'font-sans',
    },
    defaultLayouts: {
      desktop: { x: 60, y: 40, width: 880, height: 80, hidden: false },
      tablet: { x: 40, y: 30, width: 688, height: 70, hidden: false },
      mobile: { x: 20, y: 20, width: 335, height: 80, hidden: false },
    },
  },
  {
    type: 'paragraph',
    label: 'Paragraf Teks',
    icon: 'type',
    defaultProps: {
      layerName: 'Paragraf Deskripsi',
      text: 'Platform pembuatan situs interaktif yang memberikan fleksibilitas penuh untuk menyesuaikan tata letak, warna, dan gaya secara real-time.',
      align: 'center',
      fontSize: 'text-base md:text-lg',
      textColor: '#475569',
      maxWidth: 'max-w-2xl',
    },
    defaultLayouts: {
      desktop: { x: 60, y: 130, width: 880, height: 60, hidden: false },
      tablet: { x: 40, y: 110, width: 688, height: 60, hidden: false },
      mobile: { x: 20, y: 110, width: 335, height: 80, hidden: false },
    },
  },
  {
    type: 'button',
    label: 'Tombol Aksi (Button)',
    icon: 'mouse-pointer-click',
    defaultProps: {
      layerName: 'Tombol',
      text: 'Klik Di Sini',
      url: '#',
      bgColor: '#2563eb',
      textColor: '#ffffff',
      size: 'md',
      rounded: 'rounded-lg',
      fullWidth: false,
    },
    defaultLayouts: {
      desktop: { x: 60, y: 210, width: 180, height: 48, hidden: false },
      tablet: { x: 40, y: 190, width: 170, height: 46, hidden: false },
      mobile: { x: 20, y: 210, width: 335, height: 48, hidden: false },
    },
  },
  {
    type: 'badge',
    label: 'Lencana Status (Badge)',
    icon: 'tag',
    defaultProps: {
      layerName: 'Badge',
      text: 'Baru',
      bgColor: '#dbeafe',
      textColor: '#1d4ed8',
      size: 'sm',
      rounded: 'rounded-full',
    },
    defaultLayouts: {
      desktop: { x: 60, y: 40, width: 80, height: 28, hidden: false },
      tablet: { x: 40, y: 30, width: 76, height: 26, hidden: false },
      mobile: { x: 20, y: 20, width: 70, height: 24, hidden: false },
    },
  },
  {
    type: 'image',
    label: 'Gambar & Media',
    icon: 'image',
    defaultProps: {
      layerName: 'Gambar Visual',
      url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
      alt: 'Dashboard Showcase',
      caption: 'Antarmuka manajemen analitik serba guna',
      rounded: 'rounded-2xl',
      shadow: 'shadow-xl shadow-blue-500/10',
    },
    defaultLayouts: {
      desktop: { x: 60, y: 40, width: 400, height: 280, hidden: false },
      tablet: { x: 40, y: 30, width: 340, height: 240, hidden: false },
      mobile: { x: 20, y: 20, width: 335, height: 200, hidden: false },
    },
  },
  {
    type: 'card',
    label: 'Kartu Konten (Card)',
    icon: 'square',
    defaultProps: {
      layerName: 'Kartu',
      title: 'Judul Kartu',
      description: 'Deskripsi singkat tentang isi kartu ini.',
      imageUrl: '',
      bgColor: '#ffffff',
      textColor: '#0f172a',
      accentColor: '#2563eb',
      rounded: 'rounded-2xl',
      shadow: 'shadow-md',
      borderWidth: 'border',
      borderColor: '#e2e8f0',
    },
    defaultLayouts: {
      desktop: { x: 60, y: 40, width: 300, height: 220, hidden: false },
      tablet: { x: 40, y: 30, width: 220, height: 200, hidden: false },
      mobile: { x: 20, y: 20, width: 335, height: 200, hidden: false },
    },
  },
];
