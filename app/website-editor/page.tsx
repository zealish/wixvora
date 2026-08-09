'use client'

import { Plus_Jakarta_Sans, Poppins, Playfair_Display, Fira_Code } from 'next/font/google'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta'
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-poppins'
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-playfair'
})

const firaCode = Fira_Code({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-fira-code'
})

type BlockType = 'navbar' | 'hero' | 'container' | 'grid_custom' | 'heading' | 'paragraph' | 'image' | 'pricing' | 'form_contact' | 'footer'

interface Block {
  id: string
  type: BlockType
  hidden: boolean
  props: Record<string, any>
}

interface PageSettings {
  title: string
  faviconUrl: string
  customCSS: string
}

// @ts-expect-error - EditorState will be used in later tasks
interface EditorState {
  blocks: Block[]
  selectedBlockId: string | null
  pageSettings: PageSettings
  history: Block[][]
  historyIndex: number
  viewport: 'desktop' | 'tablet' | 'mobile'
  isDragging: boolean
}

// @ts-expect-error - Constants will be used in later tasks
const COLOR_PALETTES = [
  '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1',
  '#2563eb', '#3b82f6', '#0284c7', '#0d9488', '#10b981',
  '#ef4444', '#f43f5e', '#f59e0b', '#8b5cf6', '#d946ef',
  '#0f172a', '#1e293b', '#334155', '#475569', '#64748b'
]

// @ts-expect-error - Constants will be used in later tasks
const GRADIENT_PRESETS = [
  { name: 'None (Solid)', value: '' },
  { name: 'Soft Sky', value: 'bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-100' },
  { name: 'Warm Sunset', value: 'bg-gradient-to-r from-amber-50 via-orange-50 to-rose-100' },
  { name: 'Fresh Mint', value: 'bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-100' },
  { name: 'Lavender Mist', value: 'bg-gradient-to-r from-purple-50 via-fuchsia-50 to-indigo-100' },
  { name: 'Vibrant Light', value: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600' }
]

// @ts-expect-error - Constants will be used in later tasks
const BLOCK_CATALOG = [
  {
    category: 'Kontainer & Seksi',
    items: [
      {
        type: 'container' as BlockType,
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
        type: 'navbar' as BlockType,
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
        type: 'heading' as BlockType,
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
        type: 'paragraph' as BlockType,
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
        type: 'image' as BlockType,
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
        type: 'grid_custom' as BlockType,
        label: 'Grid Kolom Kustom (Fitur)',
        icon: 'grid',
        defaultProps: {
          layerName: 'Grid Fitur Interaktif',
          title: 'Keunggulan Produk Kami',
          subtitle: 'Kustomisasi setiap kolom secara penuh sesuai kebutuhan Anda',
          columnsCount: 3,
          gap: 'gap-6',
          columns: [
            { icon: 'sparkles', title: 'Performa Kilat', desc: 'Dimuat dengan kecepatan tinggi tanpa ketergantungan library berat.', bgColor: '#f8fafc', textColor: '#0f172a', accentColor: '#2563eb', btnText: 'Pelajari', btnUrl: '#' },
            { icon: 'palette', title: 'Warna Kustom', desc: 'Atur warna Hex/RGB kustom untuk setiap kartu secara terpisah.', bgColor: '#ffffff', textColor: '#0f172a', accentColor: '#059669', btnText: 'Coba Warna', btnUrl: '#' },
            { icon: 'code', title: 'Ekspor Bersih', desc: 'Dapatkan hasil kode HTML5 & Tailwind CSS murni kapan saja.', bgColor: '#0f172a', textColor: '#0f172a', accentColor: '#d97706', btnText: 'Unduh Kode', btnUrl: '#' }
          ]
        }
      },
      {
        type: 'hero' as BlockType,
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
        type: 'pricing' as BlockType,
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
          features: ['Unlimted Block Components', 'Kustomisasi Warna Hex & Gradien', 'Ekspor Kode HTML & JSON', 'Dukungan Prioritas 24/7'],
          buttonText: 'Pilih Paket Pro'
        }
      },
      {
        type: 'form_contact' as BlockType,
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
        type: 'footer' as BlockType,
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
  }
]

function createUniqueId(): string {
  return 'layer_' + Math.random().toString(36).substr(2, 9)
}

// @ts-expect-error - Constants will be used in later tasks
const DEFAULT_BLOCKS: Block[] = [
  { id: createUniqueId(), type: 'navbar', hidden: false, props: { layerName: 'Navbar Utama', logoText: 'WebCraft Pro', bgColor: '#ffffff', textColor: '#0f172a', accentColor: '#2563eb', links: [{ label: 'Fitur', url: '#' }, { label: 'Harga', url: '#' }, { label: 'Dokumentasi', url: '#' }], ctaText: 'Daftar Gratis', ctaUrl: '#' } },
  { id: createUniqueId(), type: 'hero', hidden: false, props: { layerName: 'Hero SaaS', badge: '✨ Re-imagined Light Block Builder', title: 'Visual Block Builder Terbaik untuk Tim Modern', subtitle: 'Rancang, sesuaikan warna, dan atur struktur halaman situs responsif hanya dalam hitungan menit.', buttonText: 'Mulai Bebas Biaya', buttonUrl: '#', secondaryButtonText: 'Lihat Demo', bgColor: '#ffffff', textColor: '#0f172a', bgGradient: 'bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-100', align: 'center' } },
  { id: createUniqueId(), type: 'grid_custom', hidden: false, props: { layerName: 'Grid Fitur Utama', title: 'Fitur Unggulan Yang Sangat Fleksibel', subtitle: 'Setiap kolom dapat disesuaikan secara khusus sesuai preferensi visual Anda', columnsCount: 3, gap: 'gap-6', columns: [
    { icon: 'grid', title: 'Grid Kolom Dinamis', desc: 'Atur 1 sampai 4 kolom dengan gaya background independen.', bgColor: '#ffffff', textColor: '#0f172a', accentColor: '#2563eb', btnText: 'Detail', btnUrl: '#' },
    { icon: 'palette', title: 'Warna Hex Kustom', desc: 'Kontrol penuh warna background, teks, dan border per elemen.', bgColor: '#f8fafc', textColor: '#0f172a', accentColor: '#059669', btnText: 'Coba', btnUrl: '#' },
    { icon: 'layers', title: 'Pohon Layer Rapi', desc: 'Kelola urutan dan nama layer dengan navigasi sidebar intuitif.', bgColor: '#ffffff', textColor: '#0f172a', accentColor: '#d97706', btnText: 'Kelola', btnUrl: '#' }
  ] } },
  { id: createUniqueId(), type: 'footer', hidden: false, props: { layerName: 'Footer', brandName: 'WebCraft Studio Pro', copyright: '© 2026 WebCraft Studio. Dibuat dengan fleksibilitas tanpa batas.', bgColor: '#f1f5f9', textColor: '#64748b' } }
]

export default function WebsiteEditorPage() {
  return (
    <div className={`${plusJakarta.variable} ${poppins.variable} ${playfair.variable} ${firaCode.variable}`}>
      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        .editor-sidebar { border-right: 1px solid #e5e7eb; overflow-y: auto; }
        .canvas-area { flex: 1; overflow: auto; background: #f9fafb; }
        .properties-panel { border-left: 1px solid #e5e7eb; overflow-y: auto; }
        
        .block-wrapper { position: relative; border: 2px dashed transparent; transition: border-color 0.2s; }
        .block-wrapper:hover { border-color: #3b82f6; }
        .block-wrapper.selected { border-color: #10b981; background: rgba(16, 185, 129, 0.05); }
        
        .color-picker-wrapper { position: relative; }
        .color-swatch { width: 40px; height: 40px; border-radius: 4px; border: 1px solid #d1d5db; cursor: pointer; }
        
        .viewport-desktop { max-width: 100%; }
        .viewport-tablet { max-width: 768px; margin: 0 auto; }
        .viewport-mobile { max-width: 375px; margin: 0 auto; }
        
        [contenteditable="true"]:focus { outline: 2px solid #3b82f6; outline-offset: 2px; }
      `}</style>
      <h1>Website Editor - Loading...</h1>
    </div>
  )
}
