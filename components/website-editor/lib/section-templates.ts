// components/website-editor/lib/section-templates.ts

import type { Section } from './block-types';

function createId(prefix: string): string {
  return prefix + '_' + Math.random().toString(36).slice(2, 10);
}

export interface SectionTemplate {
  id: string;
  title: string;
  category: string;
  desc: string;
  previewBg: string;
  factory: () => Section;
}

export const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    id: 'hero',
    title: 'Hero Strip Section',
    category: 'Header / Banner',
    desc: 'Tampilan utama memukau dengan judul besar, subteks, tombol CTA, dan gambar.',
    previewBg: 'bg-gradient-to-r from-blue-600 to-indigo-700',
    factory: () => ({
      id: createId('sec'),
      title: 'Hero Banner',
      heights: { desktop: 480, tablet: 460, mobile: 640 },
      bgColor: '#ffffff',
      bgGradient: 'bg-gradient-to-r from-blue-50 via-slate-50 to-indigo-50',
      blocks: [
        {
          id: createId('el'),
          type: 'heading',
          hidden: false,
          props: { text: 'Tata Letak Persisten Untuk Desktop, Tablet & Mobile' },
          zIndex: 10,
          layouts: {
            desktop: { x: 60, y: 90, width: 580, height: 100, hidden: false },
            tablet: { x: 40, y: 75, width: 440, height: 100, hidden: false },
            mobile: { x: 20, y: 65, width: 335, height: 110, hidden: false }
          }
        },
        {
          id: createId('el'),
          type: 'paragraph',
          hidden: false,
          props: { text: 'Geser posisi item pada mode Desktop tidak akan mengubah layout di Mobile!' },
          zIndex: 10,
          layouts: {
            desktop: { x: 60, y: 200, width: 520, height: 70, hidden: false },
            tablet: { x: 40, y: 185, width: 430, height: 80, hidden: false },
            mobile: { x: 20, y: 185, width: 335, height: 110, hidden: false }
          }
        },
        {
          id: createId('el'),
          type: 'hero',
          hidden: false,
          props: { text: 'Mulai Sekarang', bgColor: '#2563eb', textColor: '#ffffff' },
          zIndex: 12,
          layouts: {
            desktop: { x: 60, y: 290, width: 190, height: 48, hidden: false },
            tablet: { x: 40, y: 280, width: 180, height: 46, hidden: false },
            mobile: { x: 20, y: 305, width: 335, height: 48, hidden: false }
          }
        },
        {
          id: createId('el'),
          type: 'image',
          hidden: false,
          props: { src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80', alt: 'Hero' },
          zIndex: 8,
          layouts: {
            desktop: { x: 670, y: 50, width: 320, height: 320, hidden: false },
            tablet: { x: 480, y: 75, width: 250, height: 250, hidden: false },
            mobile: { x: 20, y: 375, width: 335, height: 220, hidden: false }
          }
        }
      ]
    })
  },
  {
    id: 'features',
    title: 'Features 3-Column',
    category: 'Content / Features',
    desc: 'Grid 3 kolom berisi kartu fitur dengan judul dan warna aksen.',
    previewBg: 'bg-emerald-600',
    factory: () => ({
      id: createId('sec'),
      title: 'Fitur Unggulan',
      heights: { desktop: 420, tablet: 420, mobile: 820 },
      bgColor: '#f8fafc',
      bgGradient: '',
      blocks: [
        {
          id: createId('el'),
          type: 'heading',
          hidden: false,
          props: { text: 'Satu Komponen, Banyak Layout Sesuai Layar' },
          zIndex: 10,
          layouts: {
            desktop: { x: 60, y: 40, width: 880, height: 50, hidden: false },
            tablet: { x: 40, y: 30, width: 688, height: 50, hidden: false },
            mobile: { x: 20, y: 20, width: 335, height: 60, hidden: false }
          }
        },
        {
          id: createId('el'),
          type: 'container',
          hidden: false,
          props: { title: 'Desktop Persistence', bgColor: '#ffffff' },
          zIndex: 5,
          layouts: {
            desktop: { x: 60, y: 120, width: 280, height: 220, hidden: false },
            tablet: { x: 40, y: 110, width: 220, height: 220, hidden: false },
            mobile: { x: 20, y: 90, width: 335, height: 220, hidden: false }
          }
        },
        {
          id: createId('el'),
          type: 'container',
          hidden: false,
          props: { title: 'Tablet Adaption', bgColor: '#ffffff' },
          zIndex: 5,
          layouts: {
            desktop: { x: 360, y: 120, width: 280, height: 220, hidden: false },
            tablet: { x: 274, y: 110, width: 220, height: 220, hidden: false },
            mobile: { x: 20, y: 330, width: 335, height: 220, hidden: false }
          }
        },
        {
          id: createId('el'),
          type: 'container',
          hidden: false,
          props: { title: 'Mobile Optimization', bgColor: '#ffffff' },
          zIndex: 5,
          layouts: {
            desktop: { x: 660, y: 120, width: 280, height: 220, hidden: false },
            tablet: { x: 508, y: 110, width: 220, height: 220, hidden: false },
            mobile: { x: 20, y: 570, width: 335, height: 220, hidden: false }
          }
        }
      ]
    })
  },
  {
    id: 'cta_banner',
    title: 'CTA Banner',
    category: 'Promotional',
    desc: 'Strip penutup mencolok untuk mendorong konversi.',
    previewBg: 'bg-indigo-600',
    factory: () => ({
      id: createId('sec'),
      title: 'Call to Action',
      heights: { desktop: 320, tablet: 320, mobile: 420 },
      bgColor: '#2563eb',
      bgGradient: 'bg-gradient-to-r from-blue-600 to-indigo-700',
      blocks: [
        {
          id: createId('el'),
          type: 'heading',
          hidden: false,
          props: { text: 'Siap Membuat Website Impian Anda?' },
          zIndex: 10,
          layouts: {
            desktop: { x: 100, y: 60, width: 824, height: 60, hidden: false },
            tablet: { x: 50, y: 50, width: 668, height: 60, hidden: false },
            mobile: { x: 20, y: 30, width: 335, height: 80, hidden: false }
          }
        },
        {
          id: createId('el'),
          type: 'paragraph',
          hidden: false,
          props: { text: 'Gunakan WebCraft Studio sekarang dan buat landing page responsif dalam hitungan menit.' },
          zIndex: 10,
          layouts: {
            desktop: { x: 200, y: 130, width: 624, height: 50, hidden: false },
            tablet: { x: 100, y: 120, width: 568, height: 50, hidden: false },
            mobile: { x: 20, y: 120, width: 335, height: 80, hidden: false }
          }
        },
        {
          id: createId('el'),
          type: 'hero',
          hidden: false,
          props: { text: 'Coba Gratis Sekarang', bgColor: '#ffffff', textColor: '#1d4ed8' },
          zIndex: 12,
          layouts: {
            desktop: { x: 412, y: 200, width: 200, height: 50, hidden: false },
            tablet: { x: 284, y: 190, width: 200, height: 50, hidden: false },
            mobile: { x: 20, y: 220, width: 335, height: 50, hidden: false }
          }
        }
      ]
    })
  },
  {
    id: 'blank',
    title: 'Blank Section',
    category: 'Basic',
    desc: 'Seksi kosong untuk membangun dari nol.',
    previewBg: 'bg-slate-200',
    factory: () => ({
      id: createId('sec'),
      title: 'Blank Section',
      heights: { desktop: 400, tablet: 400, mobile: 500 },
      bgColor: '#ffffff',
      bgGradient: '',
      blocks: []
    })
  }
];
