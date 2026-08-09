import { Block, PageSettings } from './block-types';

function generateBlockHTML(block: Block): string {
  const p = block.props;

  switch (block.type) {
    case 'navbar':
      return `
    <nav class="fixed top-0 left-0 right-0 z-50 ${p.bgColor || 'bg-white/80 backdrop-blur-md'} ${p.textColor || 'text-slate-900'} border-b border-slate-200/60">
      <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" class="text-xl font-bold">${p.logoText || 'Brand'}</a>
        <div class="hidden md:flex items-center gap-8">
          ${(p.links || []).map((l: string) => `<a href="#" class="text-sm font-medium hover:text-blue-600 transition-colors">${l}</a>`).join('')}
          <button class="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">${p.ctaText || 'CTA'}</button>
        </div>
      </div>
    </nav>`;

    case 'hero':
      return `
    <section class="relative bg-gradient-to-br ${p.bgGradient || 'from-slate-900 to-slate-800'} ${p.textColor || 'text-white'} ${p.align || 'text-center'} ${p.paddingY || 'py-24'} overflow-hidden">
      <div class="relative z-10 max-w-4xl mx-auto px-6">
        ${p.badge ? `<div class="inline-block bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">${p.badge}</div>` : ''}
        <h1 class="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">${p.title || 'Judul Hero'}</h1>
        <p class="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">${p.subtitle || 'Subjudul hero'}</p>
        <div class="flex gap-4 ${p.align === 'text-left' ? 'justify-start' : p.align === 'text-right' ? 'justify-end' : 'justify-center'}">
          ${(p.buttons || []).map((b: any) => `<button class="px-8 py-3.5 rounded-xl font-semibold transition-all ${b.style}">${b.text}</button>`).join('')}
        </div>
      </div>
    </section>`;

    case 'container':
      return `
    <section class="${p.bgColor || 'bg-white'} ${p.paddingY || 'py-16'} ${p.paddingX || 'px-6'}">
      <div class="${p.maxWidth || 'max-w-6xl'} ${p.mx || 'mx-auto'}">
        <!-- Container content -->
      </div>
    </section>`;

    case 'grid_custom':
      return `
    <section class="py-20 px-6 bg-white">
      <div class="max-w-6xl mx-auto">
        ${p.title ? `<h2 class="text-3xl font-bold text-center mb-12">${p.title}</h2>` : ''}
        <div class="${p.gridCols || 'grid-cols-1 md:grid-cols-3'} ${p.gap || 'gap-8'} grid">
          ${(p.columns || []).map((col: any) => `
          <div class="${p.cardBg || 'bg-slate-50'} ${p.cardBorder || 'border border-slate-200'} ${p.cardRounded || 'rounded-2xl'} ${p.cardPadding || 'p-8'} ${p.textAlign || 'text-center'}">
            <div class="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
            </div>
            <h3 class="text-xl font-bold mb-2">${col.title}</h3>
            <p class="text-slate-600">${col.desc}</p>
          </div>`).join('')}
        </div>
      </div>
    </section>`;

    case 'heading':
      return `
    <${p.level || 'h1'} class="${p.fontSize || 'text-5xl'} ${p.fontWeight || 'font-extrabold'} ${p.textColor || 'text-slate-900'} ${p.align || 'text-center'} px-6 py-4">${p.text || 'Judul'}</${p.level || 'h1'}>`;

    case 'paragraph':
      return `
    <div class="px-6 py-4">
      <p class="${p.fontSize || 'text-lg'} ${p.textColor || 'text-slate-600'} ${p.align || 'text-center'} ${p.maxWidth || 'max-w-2xl'} ${p.mx || 'mx-auto'}">${p.text || 'Paragraf'}</p>
    </div>`;

    case 'image':
      return `
    <div class="px-6 py-4">
      <img src="${p.src || ''}" alt="${p.alt || ''}" class="${p.width || 'w-full'} ${p.height || 'h-auto'} ${p.rounded || 'rounded-xl'} ${p.objectFit || 'object-cover'}" />
    </div>`;

    case 'pricing':
      return `
    <section class="py-20 px-6 bg-slate-50">
      <div class="max-w-6xl mx-auto">
        ${p.title ? `<h2 class="text-3xl font-bold text-center mb-4">${p.title}</h2>` : ''}
        ${p.subtitle ? `<p class="text-slate-600 text-center mb-12">${p.subtitle}</p>` : ''}
        <div class="${p.gridCols || 'grid-cols-1 md:grid-cols-3'} ${p.gap || 'gap-8'} grid">
          ${(p.plans || []).map((plan: any) => `
          <div class="bg-white rounded-2xl border ${plan.highlighted ? 'border-blue-500 shadow-xl shadow-blue-500/10 scale-105' : 'border-slate-200'} p-8 relative">
            ${plan.highlighted ? '<div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">POPULER</div>' : ''}
            <h3 class="text-xl font-bold mb-2">${plan.name}</h3>
            <div class="mb-6"><span class="text-4xl font-extrabold">${plan.price}</span>${plan.period ? `<span class="text-slate-500">${plan.period}</span>` : ''}</div>
            <ul class="space-y-3 mb-8">
              ${(plan.features || []).map((f: string) => `<li class="flex items-center gap-3 text-sm"><svg class="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>${f}</li>`).join('')}
            </ul>
            <button class="w-full py-3 rounded-xl font-semibold ${plan.highlighted ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}">${plan.cta}</button>
          </div>`).join('')}
        </div>
      </div>
    </section>`;

    case 'form_contact':
      return `
    <section class="py-20 px-6 bg-white">
      <div class="max-w-2xl mx-auto">
        <div class="${p.bgColor || 'bg-slate-50'} ${p.cardBorder || 'border border-slate-200'} ${p.cardRounded || 'rounded-2xl'} ${p.cardPadding || 'p-10'}">
          ${p.title ? `<h2 class="text-3xl font-bold text-center mb-2">${p.title}</h2>` : ''}
          ${p.subtitle ? `<p class="text-slate-600 text-center mb-8">${p.subtitle}</p>` : ''}
          <form class="space-y-5">
            ${(p.fields || []).map((field: any) => `
            <div>
              <label class="block text-sm font-semibold mb-1.5">${field.label}</label>
              ${field.type === 'textarea'
                ? `<textarea class="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none h-32" placeholder="${field.placeholder}"></textarea>`
                : `<input type="${field.type}" class="w-full border border-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="${field.placeholder}" />`
              }
            </div>`).join('')}
            <button type="submit" class="w-full py-3 rounded-xl font-semibold ${p.submitStyle || 'bg-blue-600 text-white hover:bg-blue-700'} transition-colors">${p.submitText || 'Kirim'}</button>
          </form>
        </div>
      </div>
    </section>`;

    case 'footer':
      return `
    <footer class="${p.bgColor || 'bg-slate-900'} ${p.textColor || 'text-slate-400'} py-16 px-6">
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 class="text-xl font-bold ${p.headingColor || 'text-white'} mb-3">${p.brandName || 'Brand'}</h3>
            <p>${p.tagline || ''}</p>
          </div>
          ${(p.columns || []).map((col: any) => `
          <div>
            <h4 class="font-semibold ${p.headingColor || 'text-white'} mb-4">${col.title}</h4>
            <ul class="space-y-2">
              ${(col.links || []).map((l: string) => `<li><a href="#" class="hover:text-white transition-colors">${l}</a></li>`).join('')}
            </ul>
          </div>`).join('')}
        </div>
        <div class="border-t border-white/10 pt-8 text-center text-sm">
          <p>${p.copyright || ''}</p>
        </div>
      </div>
    </footer>`;

    default:
      return '';
  }
}

export function generateFullHTML(blocks: Block[], pageSettings: PageSettings): string {
  const blocksHTML = blocks.filter((b) => !b.hidden).map(generateBlockHTML).join('\n');

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${pageSettings.title || 'Website'}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
  <style>body { font-family: 'Inter', sans-serif; } * { scroll-behavior: smooth; }</style>
</head>
<body class="antialiased bg-white text-slate-900">
  ${blocksHTML}
</body>
</html>`;
}

export { generateBlockHTML };
