'use client'

import { Plus_Jakarta_Sans, Poppins, Playfair_Display, Fira_Code } from 'next/font/google'
import { JSX, useRef, useEffect } from 'react'

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

// @ts-expect-error - Icon will be used in later tasks
function Icon({ name, className = 'w-5 h-5' }: { name: string; className?: string }) {
  const icons: Record<string, JSX.Element> = {
    plus: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />,
    trash: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
    copy: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />,
    arrowUp: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />,
    arrowDown: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />,
    eye: <g><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></g>,
    eyeOff: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.05 10.05 0 013.122-.813c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m-8.625-8.625l8.625 8.625" />,
    code: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />,
    desktop: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
    tablet: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />,
    mobile: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />,
    undo: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />,
    redo: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />,
    layers: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />,
    palette: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />,
    sparkles: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />,
    settings: <g><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></g>,
    download: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />,
    upload: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />,
    type: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />,
    image: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    layout: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />,
    grid: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />,
    star: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />,
    edit: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
    mail: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
    box: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />,
    bold: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />,
    italic: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h6M8 20h6M13 4l-4 16" />,
    underline: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 3v7a6 6 0 0012 0V3M4 21h16" />,
    alignLeft: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h14" />,
    alignCenter: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M5 18h14" />,
    alignRight: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M6 18h14" />
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {icons[name] || icons.sparkles}
    </svg>
  )
}

// @ts-expect-error - InlineText will be used in later tasks
function InlineText({
  value,
  onChange,
  tagName = 'span',
  className = '',
  style = {},
  placeholder = 'Ketik di sini...',
  isPreviewMode = false,
  multiline = false,
  onFocusState
}: {
  value: string
  onChange: (v: string) => void
  tagName?: string
  className?: string
  style?: React.CSSProperties
  placeholder?: string
  isPreviewMode?: boolean
  multiline?: boolean
  onFocusState?: (v: boolean) => void
}) {
  const contentRef = useRef<HTMLElement>(null)
  // @ts-expect-error - placeholder will be used in later enhancements
  const _placeholder = placeholder

  useEffect(() => {
    if (contentRef.current && contentRef.current.innerText !== (value || '')) {
      contentRef.current.innerText = value || ''
    }
  }, [value])

  if (isPreviewMode) {
    const Tag = tagName as keyof JSX.IntrinsicElements
    return <Tag className={className} style={style}>{value}</Tag>
  }

  const props = {
    ref: contentRef as any,
    contentEditable: !isPreviewMode,
    suppressContentEditableWarning: true,
    onFocus: () => onFocusState && onFocusState(true),
    onBlur: (e: any) => {
      if (onFocusState) onFocusState(false)
      const newText = e.currentTarget.innerText
      if (newText !== value) {
        onChange(newText)
      }
    },
    onKeyDown: (e: any) => {
      if (!multiline && e.key === 'Enter') {
        e.preventDefault()
        e.currentTarget.blur()
      }
    },
    className: `editable-text-field ${className}`,
    style,
    title: "Klik untuk mengedit teks langsung di canvas",
    children: value
  }

  const Tag = tagName as any
  return <Tag {...props} />
}

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
