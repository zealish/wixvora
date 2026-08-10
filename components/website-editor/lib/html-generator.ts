import { getLayout, getSectionHeight } from './viewport-utils';
import type { Section } from './block-types';

function generateResponsiveCSS(sections: Section[]): string {
  let css = `
    .section-wrapper { position: relative; width: 100%; overflow: hidden; }
    .section-content { position: relative; width: 100%; max-width: 1024px; margin: 0 auto; height: 100%; }
    .responsive-block { position: absolute !important; }
`;

  // Desktop styles (default)
  sections.forEach(section => {
    const deskH = getSectionHeight(section, 'desktop');
    css += `#sec-${section.id} { height: ${deskH}px; }\n`;

    section.blocks.forEach(block => {
      const d = getLayout(block, 'desktop');
      css += `#block-${block.id} { left: ${d.x}px; top: ${d.y}px; width: ${d.width}px; height: ${d.height}px; z-index: ${block.zIndex || 10}; display: ${d.hidden ? 'none' : 'block'}; }\n`;
    });
  });

  // Tablet media query
  css += `\n@media (max-width: 1023px) {\n`;
  sections.forEach(section => {
    const tabH = getSectionHeight(section, 'tablet');
    css += `  #sec-${section.id} { height: ${tabH}px; }\n`;
    section.blocks.forEach(block => {
      const t = getLayout(block, 'tablet');
      css += `  #block-${block.id} { left: ${t.x}px; top: ${t.y}px; width: ${t.width}px; height: ${t.height}px; display: ${t.hidden ? 'none' : 'block'}; }\n`;
    });
  });
  css += `}\n`;

  // Mobile media query
  css += `\n@media (max-width: 639px) {\n`;
  sections.forEach(section => {
    const mobH = getSectionHeight(section, 'mobile');
    css += `  #sec-${section.id} { height: ${mobH}px; }\n`;
    section.blocks.forEach(block => {
      const m = getLayout(block, 'mobile');
      css += `  #block-${block.id} { left: ${m.x}px; top: ${m.y}px; width: ${m.width}px; height: ${m.height}px; display: ${m.hidden ? 'none' : 'block'}; }\n`;
    });
  });
  css += `}\n`;

  return css;
}

export function generateFullHTML(sections: Section[]): string {
  const css = generateResponsiveCSS(sections);

  const renderedSections = sections.map(sec => {
    const renderedBlocks = sec.blocks.map(block => {
      const idAttr = `id="block-${block.id}" class="responsive-block"`;
      const layout = getLayout(block, 'desktop');
      const style = `left:${layout.x}px; top:${layout.y}px; width:${layout.width}px; height:${layout.height}px;`;

      if (block.type === 'heading') {
        return `      <h2 ${idAttr} style="${style}">${block.props?.text || ''}</h2>`;
      }
      if (block.type === 'paragraph') {
        return `      <p ${idAttr} style="${style}">${block.props?.text || ''}</p>`;
      }
      if (block.type === 'image') {
        return `      <img ${idAttr} src="${block.props?.src || ''}" alt="${block.props?.alt || ''}" style="${style} object-fit:cover;" />`;
      }
      if (block.type === 'button') {
        return `      <button ${idAttr} style="${style} background-color:#2563eb;color:#ffffff;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;">${block.props?.text || 'Click me'}</button>`;
      }
      if (block.type === 'badge') {
        return `      <span ${idAttr} style="${style} background-color:#e0e7ff;color:#3730a3;padding:4px 12px;border-radius:9999px;font-size:12px;font-weight:600;">${block.props?.text || 'Badge'}</span>`;
      }
      if (block.type === 'card') {
        return `      <div ${idAttr} style="${style} background-color:#ffffff;border-radius:12px;padding:20px;box-shadow:0 1px 3px rgba(0,0,0,0.1);">${block.props?.text || 'Card content'}</div>`;
      }
      return `      <div ${idAttr} style="${style}">${block.props?.text || block.type}</div>`;
    }).join('\n');

    return `    <!-- ${sec.title} -->
    <section id="sec-${sec.id}" class="section-wrapper ${sec.bgGradient || ''}" style="background-color:${sec.bgColor};">
      <div class="section-content">
${renderedBlocks}
      </div>
    </section>`;
  }).join('\n\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Responsive Page</title>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <style>
${css}
  </style>
</head>
<body class="bg-slate-50 font-sans antialiased">
${renderedSections}
</body>
</html>`;
}
