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

export default function WebsiteEditorPage() {
  return (
    <div className={`${plusJakarta.variable} ${poppins.variable} ${playfair.variable} ${firaCode.variable}`}>
      <h1>Website Editor - Loading...</h1>
    </div>
  )
}
