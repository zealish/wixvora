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
  content: string
  styles: Record<string, string>
  children?: Block[]
  metadata?: {
    columns?: number
    gap?: string
    alignment?: string
    imageUrl?: string
    alt?: string
    priceAmount?: string
    pricePeriod?: string
    features?: string[]
  }
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
