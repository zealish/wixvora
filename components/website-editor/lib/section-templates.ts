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
          type: 'badge',
          hidden: false,
          props: { text: '🚀 Versi 3.0 Light Rilis', bgColor: '#dbeafe', textColor: '#1d4ed8', size: 'sm', rounded: 'rounded-full' },
          zIndex: 11,
          layouts: {
            desktop: { x: 60, y: 60, width: 180, height: 30, hidden: false },
            tablet: { x: 40, y: 50, width: 170, height: 28, hidden: false },
            mobile: { x: 20, y: 40, width: 160, height: 26, hidden: false }
          }
        },
        {
          id: createId('el'),
          type: 'heading',
          hidden: false,
          props: { text: 'Tata Letak Persisten Untuk Desktop, Tablet & Mobile' },
          zIndex: 10,
          layouts: {
            desktop: { x: 60, y: 100, width: 580, height: 100, hidden: false },
            tablet: { x: 40, y: 85, width: 440, height: 100, hidden: false },
            mobile: { x: 20, y: 75, width: 335, height: 110, hidden: false }
          }
        },
        {
          id: createId('el'),
          type: 'paragraph',
          hidden: false,
          props: { text: 'Geser posisi item pada mode Desktop tidak akan mengubah layout di Mobile!' },
          zIndex: 10,
          layouts: {
            desktop: { x: 60, y: 210, width: 520, height: 70, hidden: false },
            tablet: { x: 40, y: 195, width: 430, height: 80, hidden: false },
            mobile: { x: 20, y: 195, width: 335, height: 110, hidden: false }
          }
        },
        {
          id: createId('el'),
          type: 'hero',
          hidden: false,
          props: { text: 'Mulai Sekarang', bgColor: '#2563eb', textColor: '#ffffff' },
          zIndex: 12,
          layouts: {
            desktop: { x: 60, y: 300, width: 190, height: 48, hidden: false },
            tablet: { x: 40, y: 290, width: 180, height: 46, hidden: false },
            mobile: { x: 20, y: 315, width: 335, height: 48, hidden: false }
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
            mobile: { x: 20, y: 385, width: 335, height: 220, hidden: false }
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
          type: 'card',
          hidden: false,
          props: { title: 'Desktop Persistence', description: 'Tata letak desktop tetap konsisten di semua perangkat.', bgColor: '#ffffff', textColor: '#0f172a', accentColor: '#2563eb', rounded: 'rounded-2xl', shadow: 'shadow-md', borderWidth: 'border', borderColor: '#e2e8f0' },
          zIndex: 5,
          layouts: {
            desktop: { x: 60, y: 120, width: 280, height: 220, hidden: false },
            tablet: { x: 40, y: 110, width: 220, height: 220, hidden: false },
            mobile: { x: 20, y: 90, width: 335, height: 220, hidden: false }
          }
        },
        {
          id: createId('el'),
          type: 'card',
          hidden: false,
          props: { title: 'Tablet Adaption', description: 'Penyesuaian otomatis untuk ukuran layar tablet.', bgColor: '#ffffff', textColor: '#0f172a', accentColor: '#059669', rounded: 'rounded-2xl', shadow: 'shadow-md', borderWidth: 'border', borderColor: '#e2e8f0' },
          zIndex: 5,
          layouts: {
            desktop: { x: 360, y: 120, width: 280, height: 220, hidden: false },
            tablet: { x: 274, y: 110, width: 220, height: 220, hidden: false },
            mobile: { x: 20, y: 330, width: 335, height: 220, hidden: false }
          }
        },
        {
          id: createId('el'),
          type: 'card',
          hidden: false,
          props: { title: 'Mobile Optimization', description: 'Optimasi penuh untuk tampilan mobile responsif.', bgColor: '#ffffff', textColor: '#0f172a', accentColor: '#d97706', rounded: 'rounded-2xl', shadow: 'shadow-md', borderWidth: 'border', borderColor: '#e2e8f0' },
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
          type: 'button',
          hidden: false,
          props: { text: 'Coba Gratis Sekarang', url: '#', bgColor: '#ffffff', textColor: '#1d4ed8', size: 'md', rounded: 'rounded-lg', fullWidth: false },
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
    id: 'testimonials',
    title: 'Testimonials',
    category: 'Social Proof',
    desc: 'Testimoni pelanggan dengan kartu testimonial dan info profil.',
    previewBg: 'bg-violet-600',
    factory: () => ({
      id: createId('sec'),
      title: 'Testimoni Pelanggan',
      heights: { desktop: 500, tablet: 500, mobile: 780 },
      bgColor: '#f8fafc',
      bgGradient: '',
      blocks: [
        {
          id: createId('el'),
          type: 'heading',
          hidden: false,
          props: { text: 'Apa Kata Mereka Tentang Kami' },
          zIndex: 10,
          layouts: {
            desktop: { x: 60, y: 40, width: 880, height: 50, hidden: false },
            tablet: { x: 40, y: 30, width: 688, height: 50, hidden: false },
            mobile: { x: 20, y: 20, width: 335, height: 60, hidden: false }
          }
        },
        {
          id: createId('el'),
          type: 'card',
          hidden: false,
          props: { title: 'Andi Prasetyo', description: '"Platform ini mengubah cara kami membangun website. Sangat intuitif dan cepat."', bgColor: '#ffffff', textColor: '#0f172a', accentColor: '#2563eb', rounded: 'rounded-2xl', shadow: 'shadow-md', borderWidth: 'border', borderColor: '#e2e8f0' },
          zIndex: 5,
          layouts: {
            desktop: { x: 60, y: 120, width: 280, height: 200, hidden: false },
            tablet: { x: 40, y: 110, width: 220, height: 200, hidden: false },
            mobile: { x: 20, y: 90, width: 335, height: 200, hidden: false }
          }
        },
        {
          id: createId('el'),
          type: 'card',
          hidden: false,
          props: { title: 'Sari Dewi', description: '"Sangat mudah digunakan bahkan untuk pemula. Hasilnya profesional."', bgColor: '#ffffff', textColor: '#0f172a', accentColor: '#059669', rounded: 'rounded-2xl', shadow: 'shadow-md', borderWidth: 'border', borderColor: '#e2e8f0' },
          zIndex: 5,
          layouts: {
            desktop: { x: 360, y: 120, width: 280, height: 200, hidden: false },
            tablet: { x: 274, y: 110, width: 220, height: 200, hidden: false },
            mobile: { x: 20, y: 310, width: 335, height: 200, hidden: false }
          }
        },
        {
          id: createId('el'),
          type: 'card',
          hidden: false,
          props: { title: 'Budi Hartono', description: '"Fitur responsifnya luar biasa. Website kami kini sempurna di semua perangkat."', bgColor: '#ffffff', textColor: '#0f172a', accentColor: '#d97706', rounded: 'rounded-2xl', shadow: 'shadow-md', borderWidth: 'border', borderColor: '#e2e8f0' },
          zIndex: 5,
          layouts: {
            desktop: { x: 660, y: 120, width: 280, height: 200, hidden: false },
            tablet: { x: 508, y: 110, width: 220, height: 200, hidden: false },
            mobile: { x: 20, y: 530, width: 335, height: 200, hidden: false }
          }
        }
      ]
    })
  },
  {
    id: 'contact_info',
    title: 'Contact Info',
    category: 'Contact',
    desc: 'Informasi kontak dengan kartu detail dan formulir singkat.',
    previewBg: 'bg-cyan-600',
    factory: () => ({
      id: createId('sec'),
      title: 'Hubungi Kami',
      heights: { desktop: 380, tablet: 380, mobile: 520 },
      bgColor: '#ffffff',
      bgGradient: '',
      blocks: [
        {
          id: createId('el'),
          type: 'heading',
          hidden: false,
          props: { text: 'Hubungi Tim Kami' },
          zIndex: 10,
          layouts: {
            desktop: { x: 60, y: 40, width: 880, height: 50, hidden: false },
            tablet: { x: 40, y: 30, width: 688, height: 50, hidden: false },
            mobile: { x: 20, y: 20, width: 335, height: 60, hidden: false }
          }
        },
        {
          id: createId('el'),
          type: 'card',
          hidden: false,
          props: { title: 'Email', description: 'hello@webcraftstudio.com', bgColor: '#f0f9ff', textColor: '#0f172a', accentColor: '#2563eb', rounded: 'rounded-2xl', shadow: 'shadow-md', borderWidth: 'border', borderColor: '#bae6fd' },
          zIndex: 5,
          layouts: {
            desktop: { x: 60, y: 120, width: 280, height: 160, hidden: false },
            tablet: { x: 40, y: 110, width: 220, height: 160, hidden: false },
            mobile: { x: 20, y: 90, width: 335, height: 140, hidden: false }
          }
        },
        {
          id: createId('el'),
          type: 'card',
          hidden: false,
          props: { title: 'Telepon', description: '+62 21 555 0123', bgColor: '#f0fdf4', textColor: '#0f172a', accentColor: '#059669', rounded: 'rounded-2xl', shadow: 'shadow-md', borderWidth: 'border', borderColor: '#bbf7d0' },
          zIndex: 5,
          layouts: {
            desktop: { x: 360, y: 120, width: 280, height: 160, hidden: false },
            tablet: { x: 274, y: 110, width: 220, height: 160, hidden: false },
            mobile: { x: 20, y: 250, width: 335, height: 140, hidden: false }
          }
        },
        {
          id: createId('el'),
          type: 'card',
          hidden: false,
          props: { title: 'Alamat', description: 'Jl. Sudirman No. 123, Jakarta', bgColor: '#fffbeb', textColor: '#0f172a', accentColor: '#d97706', rounded: 'rounded-2xl', shadow: 'shadow-md', borderWidth: 'border', borderColor: '#fde68a' },
          zIndex: 5,
          layouts: {
            desktop: { x: 660, y: 120, width: 280, height: 160, hidden: false },
            tablet: { x: 508, y: 110, width: 220, height: 160, hidden: false },
            mobile: { x: 20, y: 410, width: 335, height: 140, hidden: false }
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
