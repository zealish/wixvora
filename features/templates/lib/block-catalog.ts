import type { BlockCatalogItem } from "./block-types";

export const BLOCK_CATALOG: { category: string; items: BlockCatalogItem[] }[] = [
  {
    category: 'Kontainer & Seksi',
    items: [
      {
        type: 'container',
        label: 'Seksi Layer (Container)',
        icon: 'box' as any,
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
          content: 'Area kontainer kustom.',
        },
      },
      {
        type: 'navbar',
        label: 'Bar Navigasi (Header)',
        icon: 'layout' as any,
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
            { label: 'Kontak', url: '#' },
          ],
          ctaText: 'Mulai Sekarang',
          ctaUrl: '#',
        },
      },
    ],
  },
];

export function createBlockFromCatalog(item: BlockCatalogItem) {
  return {
    id: `layer_${Math.random().toString(36).substr(2, 9)}`,
    type: item.type,
    hidden: false,
    props: JSON.parse(JSON.stringify(item.defaultProps)),
  };
}

export const PRESET_TEMPLATES: Record<string, any[]> = {
  saas: [],
};
