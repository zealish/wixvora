import { Block } from './block-types';

export const PRESET_TEMPLATES: Record<string, { name: string; blocks: Block[] }> = {
  saas: {
    name: 'SaaS Landing Page',
    blocks: [
      {
        id: 'preset-navbar-1',
        type: 'navbar',
        hidden: false,
        props: {
          layerName: 'Navbar Utama',
          logoText: 'WebCraft Pro',
          bgColor: '#ffffff',
          textColor: '#0f172a',
          accentColor: '#2563eb',
          links: [
            { label: 'Fitur', url: '#' },
            { label: 'Harga', url: '#' },
            { label: 'Dokumentasi', url: '#' }
          ],
          ctaText: 'Daftar Gratis',
          ctaUrl: '#'
        },
      },
      {
        id: 'preset-hero-1',
        type: 'hero',
        hidden: false,
        props: {
          layerName: 'Hero SaaS',
          badge: '✨ Re-imagined Light Block Builder',
          title: 'Visual Block Builder Terbaik untuk Tim Modern',
          subtitle: 'Rancang, sesuaikan warna, dan atur struktur halaman situs responsif hanya dalam hitungan menit.',
          buttonText: 'Mulai Bebas Biaya',
          buttonUrl: '#',
          secondaryButtonText: 'Lihat Demo',
          secondaryButtonUrl: '#',
          bgColor: '#ffffff',
          textColor: '#0f172a',
          bgGradient: 'bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-100',
          align: 'center'
        },
      },
      {
        id: 'preset-grid-1',
        type: 'grid_custom',
        hidden: false,
        props: {
          layerName: 'Grid Fitur Utama',
          title: 'Fitur Unggulan Yang Sangat Fleksibel',
          subtitle: 'Setiap kolom dapat disesuaikan secara khusus sesuai preferensi visual Anda',
          columnsCount: 3,
          gap: 'gap-6',
          columns: [
            { icon: 'grid', title: 'Grid Kolom Dinamis', desc: 'Atur 1 sampai 4 kolom dengan gaya background independen.', bgColor: '#ffffff', textColor: '#0f172a', accentColor: '#2563eb', btnText: 'Detail', btnUrl: '#' },
            { icon: 'palette', title: 'Warna Hex Kustom', desc: 'Kontrol penuh warna background, teks, dan border per elemen.', bgColor: '#f8fafc', textColor: '#0f172a', accentColor: '#059669', btnText: 'Coba', btnUrl: '#' },
            { icon: 'layers', title: 'Pohon Layer Rapi', desc: 'Kelola urutan dan nama layer dengan navigasi sidebar intuitif.', bgColor: '#ffffff', textColor: '#0f172a', accentColor: '#d97706', btnText: 'Kelola', btnUrl: '#' }
          ],
        },
      },
      {
        id: 'preset-footer-1',
        type: 'footer',
        hidden: false,
        props: {
          layerName: 'Footer',
          brandName: 'WebCraft Studio Pro',
          copyright: '© 2026 WebCraft Studio. Dibuat dengan fleksibilitas tanpa batas.',
          bgColor: '#f1f5f9',
          textColor: '#64748b'
        },
      },
    ],
  },
};
