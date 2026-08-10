import { BlockType } from './block-types';

export interface BlockCatalogItem {
  type: BlockType;
  label: string;
  icon: string;
  defaultProps: any;
}

export const BLOCK_CATALOG: { category: string; items: BlockCatalogItem[] }[] = [
  {
    category: 'Kontainer & Seksi',
    items: [
      {
        type: 'container',
        label: 'Seksi Layer (Container)',
        icon: 'box',
        defaultProps: {
          layerName: 'Seksi Utama Kustom',
          paddingY: 'py-12',
          paddingX: 'px-6',
          bgColor: '#ffffff',
          textColor: '#0f172a',
          bgGradient: '',
          borderRadius: 'rounded-2xl',
          borderWidth: 'border',
          borderColor: '#e2e8f0',
          content: 'Area kontainer kustom. Anda bisa menambahkan judul, paragraf, dan elemen di dalamnya dengan gaya terang dan bersih.'
        }
      },
      {
        type: 'navbar',
        label: 'Bar Navigasi (Header)',
        icon: 'layout',
        defaultProps: {
          layerName: 'Header Navigasi',
          logoText: 'WebCraft Studio',
          bgColor: '#ffffff',
          textColor: '#0f172a',
          accentColor: '#2563eb',
          links: [
            { label: 'Beranda', url: '#' },
            { label: 'Fitur', url: '#' },
            { label: 'Harga', url: '#' },
            { label: 'Kontak', url: '#' }
          ],
          ctaText: 'Mulai Sekarang',
          ctaUrl: '#'
        }
      }
    ]
  },
  {
    category: 'Teks & Media',
    items: [
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
          fontFamily: 'font-sans'
        }
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
          maxWidth: 'max-w-2xl'
        }
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
          shadow: 'shadow-xl shadow-blue-500/10'
        }
      }
    ]
  },
  {
    category: 'Grid & Layout Fleksibel',
    items: [
      {
        type: 'grid_custom',
        label: 'Grid Kolom Kustom (Fitur)',
        icon: 'grid',
        defaultProps: {
          layerName: 'Grid Fitur Interaktif',
          title: 'Keunggulan Produk Kami',
          subtitle: 'Kustomisasi setiap kolom secara penuh sesuai kebutuhan Anda',
          columnsCount: 3,
          gap: 'gap-6',
          columns: [
            {
              icon: 'sparkles',
              title: 'Performa Kilat',
              desc: 'Dimuat dengan kecepatan tinggi tanpa ketergantungan library berat.',
              bgColor: '#f8fafc',
              textColor: '#0f172a',
              accentColor: '#2563eb',
              btnText: 'Pelajari',
              btnUrl: '#'
            },
            {
              icon: 'palette',
              title: 'Warna Kustom',
              desc: 'Atur warna Hex/RGB kustom untuk setiap kartu secara terpisah.',
              bgColor: '#ffffff',
              textColor: '#0f172a',
              accentColor: '#059669',
              btnText: 'Coba Warna',
              btnUrl: '#'
            },
            {
              icon: 'code',
              title: 'Ekspor Bersih',
              desc: 'Dapatkan hasil kode HTML5 & Tailwind CSS murni kapan saja.',
              bgColor: '#f8fafc',
              textColor: '#0f172a',
              accentColor: '#d97706',
              btnText: 'Unduh Kode',
              btnUrl: '#'
            }
          ]
        }
      },
      {
        type: 'hero',
        label: 'Hero Banner Premium',
        icon: 'layout',
        defaultProps: {
          layerName: 'Hero Section',
          badge: '🚀 Versi 3.0 Light Rilis',
          title: 'Ciptakan Website Impian Bebas Batasan',
          subtitle: 'Ubah ide bisnis menjadi tampilan nyata secara visual dengan fleksibilitas editor blok modern.',
          buttonText: 'Mulai Uji Coba',
          buttonUrl: '#',
          secondaryButtonText: 'Lihat Live Demo',
          secondaryButtonUrl: '#',
          bgColor: '#ffffff',
          textColor: '#0f172a',
          bgGradient: 'bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-100',
          align: 'center'
        }
      }
    ]
  },
  {
    category: 'Pemasaran & Kontak',
    items: [
      {
        type: 'pricing',
        label: 'Tabel Harga Pro',
        icon: 'star',
        defaultProps: {
          layerName: 'Tabel Harga',
          badge: 'Rekomendasi',
          planName: 'Paket Pro Builder',
          price: 'Rp 199.000',
          period: '/bulan',
          bgColor: '#ffffff',
          accentColor: '#2563eb',
          textColor: '#0f172a',
          features: [
            'Unlimted Block Components',
            'Kustomisasi Warna Hex & Gradien',
            'Ekspor Kode HTML & JSON',
            'Dukungan Prioritas 24/7'
          ],
          buttonText: 'Pilih Paket Pro',
          buttonUrl: '#'
        }
      },
      {
        type: 'form_contact',
        label: 'Formulir Kontak / Opt-in',
        icon: 'mail',
        defaultProps: {
          layerName: 'Form Kontak',
          title: 'Berlangganan Buletin Kami',
          subtitle: 'Dapatkan tips desain dan pembaruan fitur langsung di email Anda.',
          placeholder: 'Masukkan alamat email Anda...',
          buttonText: 'Langganan Sekarang',
          bgColor: '#f8fafc',
          textColor: '#0f172a',
          accentColor: '#2563eb'
        }
      },
      {
        type: 'footer',
        label: 'Footer Situs',
        icon: 'layout',
        defaultProps: {
          layerName: 'Footer',
          brandName: 'WebCraft Studio',
          copyright: '© 2026 WebCraft Studio Inc. Hak cipta dilindungi undang-undang.',
          bgColor: '#f1f5f9',
          textColor: '#64748b'
        }
      }
    ]
  },
  {
    category: 'Elemen UI',
    items: [
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
          fullWidth: false
        }
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
          rounded: 'rounded-full'
        }
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
          borderColor: '#e2e8f0'
        }
      }
    ]
  }
];
