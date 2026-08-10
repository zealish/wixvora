import { getLayout, getSectionHeight } from './viewport-utils';
import type { Section } from './block-types';

function generateFullHTML(sections: Section[]): string {
  let cssRules = `
    .sec-wrapper { position: relative; width: 100%; overflow: hidden; }
    .sec-content { position: relative; width: 100%; max-width: 1024px; margin: 0 auto; height: 100%; }
    .responsive-el { position: absolute !important; transition: all 0.2s ease; }
`;

  sections.forEach(sec => {
    const deskH = getSectionHeight(sec, 'desktop');
    const tabH = getSectionHeight(sec, 'tablet');
    const mobH = getSectionHeight(sec, 'mobile');

    cssRules += `    #sec-${sec.id} { height: ${deskH}px; }\n`;

    sec.elements.forEach(el => {
      const d = getLayout(el, 'desktop');
      cssRules += `    #el-${el.id} { left: ${d.x}px; top: ${d.y}px; width: ${d.width}px; height: ${d.height}px; z-index: ${el.zIndex || 10}; display: ${d.hidden ? 'none' : 'block'}; }\n`;
    });

    cssRules += `\n    @media (max-width: 1023px) {\n`;
    cssRules += `      #sec-${sec.id} { height: ${tabH}px; }\n`;
    sec.elements.forEach(el => {
      const t = getLayout(el, 'tablet');
      cssRules += `      #el-${el.id} { left: ${t.x}px; top: ${t.y}px; width: ${t.width}px; height: ${t.height}px; display: ${t.hidden ? 'none' : 'block'}; }\n`;
    });
    cssRules += `    }\n`;

    cssRules += `\n    @media (max-width: 639px) {\n`;
    cssRules += `      #sec-${sec.id} { height: ${mobH}px; }\n`;
    sec.elements.forEach(el => {
      const m = getLayout(el, 'mobile');
      cssRules += `      #el-${el.id} { left: ${m.x}px; top: ${m.y}px; width: ${m.width}px; height: ${m.height}px; display: ${m.hidden ? 'none' : 'block'}; }\n`;
    });
    cssRules += `    }\n\n`;
  });

  const renderedSections = sections.map(sec => {
    const renderedElements = sec.elements.map(el => {
      const idAttr = `id="el-${el.id}" class="responsive-el"`;

      if (el.type === 'heading') {
        return `        <h2 ${idAttr} style="color: ${el.textColor}; font-size: ${el.fontSize}; font-weight: ${el.fontWeight}; text-align: ${el.textAlign || 'left'};">${el.text}</h2>`;
      }
      if (el.type === 'paragraph') {
        return `        <p ${idAttr} style="color: ${el.textColor}; font-size: ${el.fontSize}; font-weight: ${el.fontWeight}; text-align: ${el.textAlign || 'left'};">${el.text}</p>`;
      }
      if (el.type === 'button') {
        return `        <a href="${el.url || '#'}" ${idAttr} style="background-color: ${el.bgColor}; color: ${el.textColor}; border-radius: ${el.borderRadius}; border: ${el.borderColor ? `1px solid ${el.borderColor}` : 'none'}; font-size: ${el.fontSize}; font-weight: ${el.fontWeight}; display: flex; align-items: center; justify-content: center; text-decoration: none;" class="shadow-md hover:opacity-90 transition">${el.text}</a>`;
      }
      if (el.type === 'badge') {
        return `        <span ${idAttr} style="background-color: ${el.bgColor}; color: ${el.textColor}; border-radius: ${el.borderRadius}; border: 1px solid ${el.borderColor}; font-size: ${el.fontSize}; display: flex; align-items: center; justify-content: center; font-weight: 700;">${el.text}</span>`;
      }
      if (el.type === 'image') {
        return `        <img ${idAttr} src="${el.url}" alt="${el.alt || ''}" style="border-radius: ${el.borderRadius}; object-fit: ${el.objectFit || 'cover'};" class="shadow-lg" />`;
      }
      if (el.type === 'card') {
        return `        <div ${idAttr} style="background-color: ${el.bgColor}; color: ${el.textColor}; border-radius: ${el.borderRadius}; border: 1px solid ${el.borderColor}; padding: 20px; box-sizing: border-box;" class="shadow-lg">
            <h3 style="color: ${el.accentColor}; margin: 0 0 8px 0; font-size: 18px; font-weight: 700;">${el.title}</h3>
            <p style="margin: 0; font-size: 13px; opacity: 0.8; line-height: 1.5;">${el.subtitle}</p>
        </div>`;
      }
      return '';
    }).join('\n');

    return `    <!-- ${sec.title} -->
    <section id="sec-${sec.id}" style="background-color: ${sec.bgColor};" class="sec-wrapper ${sec.bgGradient}">
        <div class="sec-content">
${renderedElements}
        </div>
    </section>`;
  }).join('\n\n');

  return `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Responsive Web Page</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
${cssRules}
    </style>
</head>
<body class="bg-slate-50 font-sans antialiased text-slate-800 m-0 p-0 overflow-x-hidden">
${renderedSections}
</body>
</html>`;
}

export { generateFullHTML };
