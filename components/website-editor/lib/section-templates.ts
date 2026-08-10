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
    desc: 'Tampilan utama memukau dengan judul besar, subteks, tombol CTA, dan gambar ilustrasi.',
    previewBg: 'bg-gradient-to-r from-blue-600 to-indigo-700',
    factory: () => ({
      id: createId('sec'),
      title: 'Hero Banner Utama',
      heights: { desktop: 480, tablet: 460, mobile: 640 },
      bgColor: '#ffffff',
      bgGradient: 'bg-gradient-to-r from-blue-50 via-slate-50 to-indigo-50',
      elements: [
        {
          id: createId('el'),
          type: 'badge',
          name: 'Badge Banner',
          layouts: {
            desktop: { x: 60, y: 40, width: 250, height: 34, hidden: false },
            tablet: { x: 40, y: 30, width: 240, height: 32, hidden: false },
            mobile: { x: 20, y: 20, width: 230, height: 32, hidden: false }
          },
          zIndex: 10,
          text: '🚀 WEBCRAFT STUDIO PRO',
          bgColor: '#eff6ff',
          textColor: '#1d4ed8',
          borderColor: '#93c5fd',
          borderRadius: '9999px',
          fontSize: '11px'
        },
        {
          id: createId('el'),
          type: 'heading',
          name: 'Judul Utama Hero',
          layouts: {
            desktop: { x: 60, y: 90, width: 580, height: 100, hidden: false },
            tablet: { x: 40, y: 75, width: 440, height: 100, hidden: false },
            mobile: { x: 20, y: 65, width: 335, height: 110, hidden: false }
          },
          zIndex: 10,
          text: 'Tata Letak Persisten Untuk Desktop, Tablet & Mobile',
          fontSize: '36px',
          fontWeight: '800',
          textColor: '#0f172a',
          textAlign: 'left'
        },
        {
          id: createId('el'),
          type: 'paragraph',
          name: 'Sub-deskripsi Hero',
          layouts: {
            desktop: { x: 60, y: 200, width: 520, height: 70, hidden: false },
            tablet: { x: 40, y: 185, width: 430, height: 80, hidden: false },
            mobile: { x: 20, y: 185, width: 335, height: 110, hidden: false }
          },
          zIndex: 10,
          text: 'Geser posisi item pada mode Desktop tidak akan mengubah layout di Mobile! Beralihlah antar layar untuk menyesuaikan tata letak.',
          fontSize: '15px',
          fontWeight: '400',
          textColor: '#475569',
          textAlign: 'left'
        },
        {
          id: createId('el'),
          type: 'button',
          name: 'Tombol Utama',
          layouts: {
            desktop: { x: 60, y: 290, width: 190, height: 48, hidden: false },
            tablet: { x: 40, y: 280, width: 180, height: 46, hidden: false },
            mobile: { x: 20, y: 305, width: 335, height: 48, hidden: false }
          },
          zIndex: 12,
          text: '🔥 Mulai Sekarang',
          url: '#',
          bgColor: '#2563eb',
          textColor: '#ffffff',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '600'
        },
        {
          id: createId('el'),
          type: 'image',
          name: 'Gambar Hero',
          layouts: {
            desktop: { x: 670, y: 50, width: 320, height: 320, hidden: false },
            tablet: { x: 480, y: 75, width: 250, height: 250, hidden: false },
            mobile: { x: 20, y: 375, width: 335, height: 220, hidden: false }
          },
          zIndex: 8,
          url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
          borderRadius: '24px'
        }
      ]
    })
  },
  {
    id: 'features',
    title: 'Fitur Utama (3 Kolom)',
    category: 'Content / Features',
    desc: 'Grid 3 kolom berisi kartu fitur serbaguna dengan judul dan warna aksen.',
    previewBg: 'bg-emerald-600',
    factory: () => ({
      id: createId('sec'),
      title: 'Fitur Unggulan',
      heights: { desktop: 420, tablet: 420, mobile: 820 },
      bgColor: '#f8fafc',
      bgGradient: '',
      elements: [
        {
          id: createId('el'),
          type: 'heading',
          name: 'Judul Seksi Fitur',
          layouts: {
            desktop: { x: 60, y: 40, width: 880, height: 50, hidden: false },
            tablet: { x: 40, y: 30, width: 688, height: 50, hidden: false },
            mobile: { x: 20, y: 20, width: 335, height: 60, hidden: false }
          },
          zIndex: 10,
          text: 'Satu Komponen, Banyak Layout Sesuai Layar',
          fontSize: '28px',
          fontWeight: '800',
          textColor: '#0f172a',
          textAlign: 'center'
        },
        {
          id: createId('el'),
          type: 'card',
          name: 'Kartu Fitur 1',
          layouts: {
            desktop: { x: 60, y: 120, width: 280, height: 220, hidden: false },
            tablet: { x: 40, y: 110, width: 220, height: 220, hidden: false },
            mobile: { x: 20, y: 90, width: 335, height: 220, hidden: false }
          },
          zIndex: 5,
          title: 'Desktop Persistence',
          subtitle: 'Atur layout ideal untuk layar lebar dengan kebebasan posisi pixel presisi.',
          bgColor: '#ffffff',
          textColor: '#1e293b',
          borderColor: '#e2e8f0',
          borderRadius: '16px',
          accentColor: '#2563eb'
        },
        {
          id: createId('el'),
          type: 'card',
          name: 'Kartu Fitur 2',
          layouts: {
            desktop: { x: 360, y: 120, width: 280, height: 220, hidden: false },
            tablet: { x: 274, y: 110, width: 220, height: 220, hidden: false },
            mobile: { x: 20, y: 330, width: 335, height: 220, hidden: false }
          },
          zIndex: 5,
          title: 'Tablet Adaption',
          subtitle: 'Sesuaikan koordinat agar proporsional pada tablet atau layar sedang.',
          bgColor: '#ffffff',
          textColor: '#1e293b',
          borderColor: '#e2e8f0',
          borderRadius: '16px',
          accentColor: '#10b981'
        },
        {
          id: createId('el'),
          type: 'card',
          name: 'Kartu Fitur 3',
          layouts: {
            desktop: { x: 660, y: 120, width: 280, height: 220, hidden: false },
            tablet: { x: 508, y: 110, width: 220, height: 220, hidden: false },
            mobile: { x: 20, y: 570, width: 335, height: 220, hidden: false }
          },
          zIndex: 5,
          title: 'Mobile Optimization',
          subtitle: 'Susun ulang secara vertikal untuk ponsel pintar tanpa merubah versi desktop.',
          bgColor: '#ffffff',
          textColor: '#1e293b',
          borderColor: '#e2e8f0',
          borderRadius: '16px',
          accentColor: '#f59e0b'
        }
      ]
    })
  },
  {
    id: 'testimonials',
    title: 'Testimonial & Review',
    category: 'Social Proof',
    desc: 'Kutipan apresiasi dari pengguna lengkap dengan foto profil dan kartu desain elegan.',
    previewBg: 'bg-amber-600',
    factory: () => ({
      id: createId('sec'),
      title: 'Ulasan Pelanggan',
      heights: { desktop: 380, tablet: 400, mobile: 620 },
      bgColor: '#ffffff',
      bgGradient: '',
      elements: [
        {
          id: createId('el'),
          type: 'heading',
          name: 'Judul Testimonial',
          layouts: {
            desktop: { x: 60, y: 40, width: 900, height: 50, hidden: false },
            tablet: { x: 40, y: 30, width: 688, height: 50, hidden: false },
            mobile: { x: 20, y: 20, width: 335, height: 60, hidden: false }
          },
          zIndex: 10,
          text: 'Dipercayai Oleh Ribuan Desainer',
          fontSize: '28px',
          fontWeight: '800',
          textColor: '#0f172a',
          textAlign: 'center'
        },
        {
          id: createId('el'),
          type: 'card',
          name: 'Testimonial Card 1',
          layouts: {
            desktop: { x: 120, y: 110, width: 380, height: 210, hidden: false },
            tablet: { x: 40, y: 100, width: 330, height: 220, hidden: false },
            mobile: { x: 20, y: 90, width: 335, height: 230, hidden: false }
          },
          zIndex: 5,
          title: '⭐⭐⭐⭐⭐ "Luar Biasa Cepat!"',
          subtitle: '"WebCraft Studio mengubah workflow pembuatan landing page kami. Sangat intuitif dan hasil kodenya bersih!" - Sarah J., UI/UX Lead',
          bgColor: '#f8fafc',
          textColor: '#1e293b',
          borderColor: '#e2e8f0',
          borderRadius: '20px',
          accentColor: '#0284c7'
        },
        {
          id: createId('el'),
          type: 'card',
          name: 'Testimonial Card 2',
          layouts: {
            desktop: { x: 530, y: 110, width: 380, height: 210, hidden: false },
            tablet: { x: 395, y: 100, width: 330, height: 220, hidden: false },
            mobile: { x: 20, y: 340, width: 335, height: 230, hidden: false }
          },
          zIndex: 5,
          title: '⭐⭐⭐⭐⭐ "Responsive Beneran"',
          subtitle: '"Fitur layout terpisah tiap viewport ini jawaban dari masalah responsive DnD selama ini. Worth it banget!" - Budi Pratama, Web Dev',
          bgColor: '#f8fafc',
          textColor: '#1e293b',
          borderColor: '#e2e8f0',
          borderRadius: '20px',
          accentColor: '#e11d48'
        }
      ]
    })
  },
  {
    id: 'cta_banner',
    title: 'Banner Call to Action',
    category: 'Promotional',
    desc: 'Strip penutup yang mencolok untuk mendorong konversi dengan tombol aksi menonjol.',
    previewBg: 'bg-indigo-600',
    factory: () => ({
      id: createId('sec'),
      title: 'Call to Action Banner',
      heights: { desktop: 320, tablet: 320, mobile: 420 },
      bgColor: '#2563eb',
      bgGradient: 'bg-gradient-to-r from-blue-600 to-indigo-700',
      elements: [
        {
          id: createId('el'),
          type: 'heading',
          name: 'Judul CTA',
          layouts: {
            desktop: { x: 100, y: 60, width: 824, height: 60, hidden: false },
            tablet: { x: 50, y: 50, width: 668, height: 60, hidden: false },
            mobile: { x: 20, y: 30, width: 335, height: 80, hidden: false }
          },
          zIndex: 10,
          text: 'Siap Membuat Website Impian Anda?',
          fontSize: '32px',
          fontWeight: '800',
          textColor: '#ffffff',
          textAlign: 'center'
        },
        {
          id: createId('el'),
          type: 'paragraph',
          name: 'Subteks CTA',
          layouts: {
            desktop: { x: 200, y: 130, width: 624, height: 50, hidden: false },
            tablet: { x: 100, y: 120, width: 568, height: 50, hidden: false },
            mobile: { x: 20, y: 120, width: 335, height: 80, hidden: false }
          },
          zIndex: 10,
          text: 'Gunakan WebCraft Studio Pro sekarang dan buat landing page responsif dalam hitungan menit.',
          fontSize: '15px',
          fontWeight: '400',
          textColor: '#bfdbfe',
          textAlign: 'center'
        },
        {
          id: createId('el'),
          type: 'button',
          name: 'Tombol CTA Aksi',
          layouts: {
            desktop: { x: 412, y: 200, width: 200, height: 50, hidden: false },
            tablet: { x: 284, y: 190, width: 200, height: 50, hidden: false },
            mobile: { x: 20, y: 220, width: 335, height: 50, hidden: false }
          },
          zIndex: 12,
          text: '🚀 Coba Gratis Sekarang',
          url: '#',
          bgColor: '#ffffff',
          textColor: '#1d4ed8',
          borderRadius: '14px',
          fontSize: '14px',
          fontWeight: '700'
        }
      ]
    })
  },
  {
    id: 'contact_info',
    title: 'Kontak & Alamat',
    category: 'Footer / Info',
    desc: 'Layout informasi kontak, formulir sederhana, dan lokasi alamat bisnis.',
    previewBg: 'bg-purple-600',
    factory: () => ({
      id: createId('sec'),
      title: 'Hubungi Kami',
      heights: { desktop: 400, tablet: 420, mobile: 650 },
      bgColor: '#ffffff',
      bgGradient: '',
      elements: [
        {
          id: createId('el'),
          type: 'heading',
          name: 'Judul Kontak',
          layouts: {
            desktop: { x: 60, y: 40, width: 450, height: 50, hidden: false },
            tablet: { x: 40, y: 30, width: 400, height: 50, hidden: false },
            mobile: { x: 20, y: 20, width: 335, height: 60, hidden: false }
          },
          zIndex: 10,
          text: 'Mari Berdiskusi Proyek Anda',
          fontSize: '28px',
          fontWeight: '800',
          textColor: '#0f172a'
        },
        {
          id: createId('el'),
          type: 'paragraph',
          name: 'Penjelasan Kontak',
          layouts: {
            desktop: { x: 60, y: 100, width: 420, height: 90, hidden: false },
            tablet: { x: 40, y: 90, width: 380, height: 100, hidden: false },
            mobile: { x: 20, y: 90, width: 335, height: 110, hidden: false }
          },
          zIndex: 10,
          text: 'Tim kami siap membantu merealisasikan konsep desain web Anda. Hubungi kami via email atau kunjungi studio kami.',
          fontSize: '14px',
          fontWeight: '400',
          textColor: '#64748b'
        },
        {
          id: createId('el'),
          type: 'card',
          name: 'Box Info Kontak',
          layouts: {
            desktop: { x: 60, y: 210, width: 420, height: 140, hidden: false },
            tablet: { x: 40, y: 200, width: 380, height: 150, hidden: false },
            mobile: { x: 20, y: 210, width: 335, height: 160, hidden: false }
          },
          zIndex: 5,
          title: '📍 Studio Utama',
          subtitle: 'Jakarta South Quarter, Tower A Lt 12, Jakarta Selatan. Email: halo@webcraftstudio.com | WA: +62 812-3456-7890',
          bgColor: '#f8fafc',
          textColor: '#1e293b',
          borderColor: '#e2e8f0',
          borderRadius: '16px',
          accentColor: '#2563eb'
        },
        {
          id: createId('el'),
          type: 'image',
          name: 'Gambar Peta',
          layouts: {
            desktop: { x: 530, y: 40, width: 430, height: 310, hidden: false },
            tablet: { x: 440, y: 40, width: 290, height: 310, hidden: false },
            mobile: { x: 20, y: 390, width: 335, height: 220, hidden: false }
          },
          zIndex: 8,
          url: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80',
          borderRadius: '20px'
        }
      ]
    })
  },
  {
    id: 'blank',
    title: 'Seksi Kosong (Blank Strip)',
    category: 'Basic',
    desc: 'Seksi bersih tanpa elemen untuk membangun layout dari nol.',
    previewBg: 'bg-slate-200',
    factory: () => ({
      id: createId('sec'),
      title: 'Seksi Kosong Baru',
      heights: { desktop: 400, tablet: 400, mobile: 500 },
      bgColor: '#ffffff',
      bgGradient: '',
      elements: []
    })
  }
];
