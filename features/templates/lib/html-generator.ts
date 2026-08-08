import type { BlockConfig, PageSettings } from "./block-types";
import { justifyAlignClass, textAlignClass } from "./block-types";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderBlockHTML(block: BlockConfig): string {
  const { type, props } = block;

  switch (type) {
    case "navbar":
      return `        <!-- Navbar -->
        <nav style="background-color: ${props.bgColor}; color: ${props.textColor};" class="py-4 px-6 border-b border-gray-800 flex items-center justify-between">
            <div class="font-bold text-xl tracking-tight">${escapeHtml(props.logoText)}</div>
            <div class="hidden md:flex items-center space-x-6 text-sm font-medium">
                ${(props.links || [])
                  .map(
                    (l) =>
                      `<a href="${escapeHtml(l.url)}" class="hover:text-blue-400 transition">${escapeHtml(l.label)}</a>`
                  )
                  .join("")}
            </div>
            <a href="${escapeHtml(props.ctaUrl || "#")}" style="background-color: ${props.accentColor};" class="px-5 py-2 rounded-xl font-semibold text-xs text-white shadow-md">${escapeHtml(props.ctaText)}</a>
        </nav>`;

    case "container":
      return `        <!-- Container Section -->
        <section style="background-color: ${props.bgColor}; color: ${props.textColor}; border-color: ${props.borderColor};" class="${props.paddingY} ${props.paddingX} ${props.borderRadius} ${props.borderWidth} ${props.bgGradient} max-w-6xl mx-auto my-6">
            <p class="leading-relaxed">${escapeHtml(props.content)}</p>
        </section>`;

    case "grid_custom":
      return `        <!-- Grid Custom Section -->
        <section class="py-16 px-6 max-w-6xl mx-auto">
            <div class="text-center mb-12">
                <h2 class="text-3xl font-extrabold text-white">${escapeHtml(props.title)}</h2>
                <p class="text-gray-400 mt-2 text-sm">${escapeHtml(props.subtitle)}</p>
            </div>
            <div class="grid grid-cols-1 ${props.columnsCount > 1 ? `md:grid-cols-${props.columnsCount}` : ""} ${props.gap}">
                ${(props.columns || [])
                    .map(
                      (col) => `
                <div style="background-color: ${col.bgColor}; color: ${col.textColor};" class="p-6 rounded-2xl border border-gray-800/80 shadow-lg flex flex-col justify-between">
                    <div>
                        <div style="color: ${col.accentColor};" class="text-2xl mb-4">★</div>
                        <h3 class="text-lg font-bold mb-2">${escapeHtml(col.title)}</h3>
                        <p class="text-xs opacity-80 leading-relaxed mb-6">${escapeHtml(col.desc)}</p>
                    </div>
                    ${col.btnText ? `<a href="${escapeHtml(col.btnUrl || "#")}" style="background-color: ${col.accentColor};" class="inline-block py-2 px-4 rounded-xl text-xs font-semibold text-white text-center">${escapeHtml(col.btnText)}</a>` : ""}
                </div>`
                    )
                    .join("")}
            </div>
        </section>`;

    case "hero":
      return `        <!-- Hero Section -->
        <section style="background-color: ${props.bgColor}; color: ${props.textColor};" class="py-20 px-6 ${props.bgGradient} ${textAlignClass(props.align)}">
            <div class="max-w-4xl mx-auto space-y-6">
                ${props.badge ? `<span class="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">${escapeHtml(props.badge)}</span>` : ""}
                <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">${escapeHtml(props.title)}</h1>
                <p class="text-base md:text-xl opacity-80 max-w-2xl mx-auto">${escapeHtml(props.subtitle)}</p>
                <div class="pt-4 flex flex-wrap ${justifyAlignClass(props.align)} gap-4">
                    ${props.buttonText ? `<a href="${escapeHtml(props.buttonUrl || "#")}" class="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/25">${escapeHtml(props.buttonText)}</a>` : ""}
                    ${props.secondaryButtonText ? `<a href="${escapeHtml(props.secondaryButtonUrl || "#")}" class="px-8 py-3.5 rounded-xl bg-gray-800 text-gray-200 font-semibold border border-gray-700">${escapeHtml(props.secondaryButtonText)}</a>` : ""}
                </div>
            </div>
        </section>`;

    case "heading":
      return `        <!-- Heading -->
        <${props.level} style="color: ${props.textColor};" class="${props.fontSize} ${props.weight} ${textAlignClass(props.align)} tracking-tight leading-snug">${escapeHtml(props.text)}</${props.level}>`;

    case "paragraph":
      return `        <!-- Paragraph -->
        <p style="color: ${props.textColor};" class="${props.fontSize} ${textAlignClass(props.align)} ${props.maxWidth} mx-auto leading-relaxed">${escapeHtml(props.text)}</p>`;

    case "image":
      return `        <!-- Image -->
        <div class="py-6 px-4 max-w-4xl mx-auto text-center">
            <img src="${escapeHtml(props.url)}" alt="${escapeHtml(props.alt || "Visual")}" class="w-full h-auto ${props.rounded} ${props.shadow} border border-slate-800 mx-auto max-h-[480px] object-cover" />
            ${props.caption ? `<p class="mt-2 text-xs text-slate-400">${escapeHtml(props.caption)}</p>` : ""}
        </div>`;

    case "pricing":
      return `        <!-- Pricing -->
        <div class="py-10 px-6 max-w-sm mx-auto">
            <div style="background-color: ${props.bgColor}; color: ${props.textColor};" class="p-8 rounded-3xl border border-slate-800 shadow-2xl relative text-center">
                ${props.badge ? `<span style="background-color: ${props.accentColor};" class="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">${escapeHtml(props.badge)}</span>` : ""}
                <h3 class="text-xl font-bold mt-1">${escapeHtml(props.planName)}</h3>
                <div class="my-4">
                    <span class="text-4xl font-extrabold">${escapeHtml(props.price)}</span>
                    ${props.period ? `<span class="text-xs opacity-70 ml-1">${escapeHtml(props.period)}</span>` : ""}
                </div>
                <ul class="space-y-2.5 text-left my-6 border-t border-b border-slate-800/80 py-4">
                    ${(props.features || [])
                      .map(
                        (f) =>
                          `<li class="flex items-center text-xs opacity-90"><span class="w-3.5 h-3.5 mr-2 text-blue-400">✓</span>${escapeHtml(f)}</li>`
                      )
                      .join("")}
                </ul>
                <a href="${escapeHtml(props.buttonUrl || "#")}" style="background-color: ${props.accentColor};" class="w-full py-3 rounded-xl text-white font-semibold text-xs shadow-lg inline-block text-center">${escapeHtml(props.buttonText)}</a>
            </div>
        </div>`;

    case "form_contact":
      return `        <!-- Contact Form -->
        <div class="py-10 px-6 max-w-2xl mx-auto">
            <div style="background-color: ${props.bgColor}; color: ${props.textColor};" class="p-8 rounded-3xl border border-slate-800 text-center space-y-4 shadow-xl">
                <h3 class="text-xl font-bold">${escapeHtml(props.title)}</h3>
                <p class="text-xs opacity-80 max-w-md mx-auto">${escapeHtml(props.subtitle)}</p>
                <div class="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
                    <input type="email" placeholder="${escapeHtml(props.placeholder || "Enter your email...")}" class="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-blue-500" />
                    <button style="background-color: ${props.accentColor};" class="px-5 py-2.5 rounded-xl text-white text-xs font-semibold shrink-0">${escapeHtml(props.buttonText)}</button>
                </div>
            </div>
        </div>`;

    case "footer":
      return `        <!-- Footer -->
        <footer style="background-color: ${props.bgColor}; color: ${props.textColor};" class="py-8 px-6 border-t border-slate-800 text-center text-xs space-y-2">
            <div class="font-bold text-sm">${escapeHtml(props.brandName)}</div>
            <p class="opacity-70">${escapeHtml(props.copyright)}</p>
        </footer>`;
  }
}

export function generateHTMLSnapshot(
  blocks: BlockConfig[],
  settings: PageSettings
): string {
  const renderedBlocks = blocks
    .filter((b) => !b.hidden)
    .map(renderBlockHTML)
    .join("\n\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(settings.title)}</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
</head>
<body style="background-color: ${settings.bgColor};" class="${settings.fontFamily} text-gray-100 antialiased">
    <main>
${renderedBlocks}
    </main>
</body>
</html>`;
}
