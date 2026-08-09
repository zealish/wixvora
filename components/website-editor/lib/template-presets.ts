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
            { label: 'Fitur', url: '#fitur' },
            { label: 'Harga', url: '#harga' },
            { label: 'Testimoni', url: '#testimoni' },
            { label: 'Kontak', url: '#kontak' }
          ],
          ctaText: 'Mulai Gratis',
          ctaUrl: '#'
        },
      },
      {
        id: 'preset-hero-1',
        type: 'hero',
        hidden: false,
        props: {
          layerName: 'Hero Section',
          badge: '🚀 Versi 3.0 Light Rilis',
          title: 'Ciptakan Website Impian Bebas Batasan',
          subtitle: 'Ubah ide bisnis menjadi tampilan nyata secara visual dengan fleksibilitas editor blok modern. Tanpa coding, tanpa ribet.',
          buttonText: 'Mulai Uji Coba Gratis',
          buttonUrl: '#',
          secondaryButtonText: 'Lihat Live Demo',
          secondaryButtonUrl: '#',
          bgColor: '#ffffff',
          textColor: '#0f172a',
          bgGradient: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-100',
          align: 'center'
        },
      },
      {
        id: 'preset-grid-features',
        type: 'grid_custom',
        hidden: false,
        props: {
          layerName: 'Fitur Unggulan',
          title: 'Kenapa Harus Memilih WebCraft?',
          subtitle: 'Solusi lengkap untuk membangun website profesional tanpa harus menulis kode',
          columnsCount: 3,
          gap: 'gap-8',
          columns: [
            {
              icon: 'sparkles',
              title: 'Drag & Drop Instan',
              desc: 'Seret dan lepas blok komponen langsung ke canvas. Ubah posisi dan urutan dalam hitungan detik.',
              bgColor: '#eff6ff',
              textColor: '#0f172a',
              accentColor: '#2563eb',
              btnText: 'Pelajari',
              btnUrl: '#'
            },
            {
              icon: 'palette',
              title: 'Kustomisasi Warna',
              desc: 'Kontrol penuh warna background, teks, dan border untuk setiap elemen secara individual.',
              bgColor: '#f0fdf4',
              textColor: '#0f172a',
              accentColor: '#059669',
              btnText: 'Coba Warna',
              btnUrl: '#'
            },
            {
              icon: 'code',
              title: 'Ekspor Kode Bersih',
              desc: 'Dapatkan hasil kode HTML5 & Tailwind CSS yang siap deploy ke hosting favorit Anda.',
              bgColor: '#fefce8',
              textColor: '#0f172a',
              accentColor: '#d97706',
              btnText: 'Lihat Contoh',
              btnUrl: '#'
            }
          ],
        },
      },
      {
        id: 'preset-stats',
        type: 'grid_custom',
        hidden: false,
        props: {
          layerName: 'Statistik Pengguna',
          title: '',
          subtitle: '',
          columnsCount: 4,
          gap: 'gap-6',
          columns: [
            {
              icon: 'star',
              title: '10K+',
              desc: 'Pengguna Aktif',
              bgColor: '#ffffff',
              textColor: '#0f172a',
              accentColor: '#2563eb',
              btnText: '',
              btnUrl: ''
            },
            {
              icon: 'layers',
              title: '500+',
              desc: 'Template Siap Pakai',
              bgColor: '#ffffff',
              textColor: '#0f172a',
              accentColor: '#059669',
              btnText: '',
              btnUrl: ''
            },
            {
              icon: 'download',
              title: '50K+',
              desc: 'Export Per Bulan',
              bgColor: '#ffffff',
              textColor: '#0f172a',
              accentColor: '#d97706',
              btnText: '',
              btnUrl: ''
            },
            {
              icon: 'check',
              title: '99.9%',
              desc: 'Uptime Server',
              bgColor: '#ffffff',
              textColor: '#0f172a',
              accentColor: '#dc2626',
              btnText: '',
              btnUrl: ''
            }
          ],
        },
      },
      {
        id: 'preset-pricing',
        type: 'pricing',
        hidden: false,
        props: {
          layerName: 'Paket Harga',
          badge: 'Paling Populer',
          planName: 'Paket Pro Builder',
          price: 'Rp 199.000',
          period: '/bulan',
          bgColor: '#ffffff',
          accentColor: '#2563eb',
          textColor: '#0f172a',
          features: [
            'Unlimited Block Components',
            'Kustomisasi Warna Hex & Gradien',
            'Ekspor Kode HTML & JSON',
            'Dukungan Prioritas 24/7',
            'Akses Template Premium',
            'Custom Domain Support'
          ],
          buttonText: 'Pilih Paket Pro',
          buttonUrl: '#'
        },
      },
      {
        id: 'preset-form-cta',
        type: 'form_contact',
        hidden: false,
        props: {
          layerName: 'Newsletter CTA',
          title: 'Siap Memulai Petualangan Digital?',
          subtitle: 'Berlangganan newsletter kami untuk tips desain, pembaruan fitur, dan penawaran eksklusif.',
          placeholder: 'Masukkan alamat email Anda...',
          buttonText: 'Langganan Gratis',
          bgColor: '#f8fafc',
          textColor: '#0f172a',
          accentColor: '#2563eb'
        },
      },
      {
        id: 'preset-footer-1',
        type: 'footer',
        hidden: false,
        props: {
          layerName: 'Footer',
          brandName: 'WebCraft Studio',
          copyright: '© 2026 WebCraft Studio Inc. Hak cipta dilindungi undang-undang.',
          bgColor: '#0f172a',
          textColor: '#94a3b8'
        },
      },
    ],
  },
};
