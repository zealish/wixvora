import { getLayout, getSectionHeight } from './viewport-utils';
import type { Section, Page, NavigationSettings } from './block-types';
import { parseVideoUrl, buildEmbedUrl } from './video-url-parser';

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
      if (el.type === 'video') {
        const parsed = parseVideoUrl((el as any).videoUrl || '');
        if (!parsed) {
          return `        <div ${idAttr} style="background-color: ${(el as any).bgColor || '#f1f5f9'}; border-radius: ${(el as any).borderRadius}; display: flex; align-items: center; justify-content: center; border: 2px dashed #cbd5e1;"><span style="color: #94a3b8; font-size: 11px;">Video URL not set</span></div>`;
        }
        const embedUrl = buildEmbedUrl(parsed, { autoplay: (el as any).autoplay, loop: (el as any).loop });
        const aspectRatio = (el as any).aspectRatio || '16:9';
        const ratioMap: Record<string, string> = { '16:9': '16/9', '4:3': '4/3', '1:1': '1/1' };
        return `        <div ${idAttr} style="width: 100%; aspect-ratio: ${ratioMap[aspectRatio] || '16/9'}; border-radius: ${(el as any).borderRadius}; overflow: hidden; background-color: ${(el as any).bgColor || '#000000'};"><iframe src="${embedUrl}" style="width: 100%; height: 100%; border: none;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
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

function generateNavigation(pages: Page[], currentPageId: string, settings?: NavigationSettings): string {
  const navBg = settings?.bgColor || '#ffffff';
  const navText = settings?.textColor || '#334155';
  const activeColor = settings?.activeColor || '#3b82f6';
  const layout = settings?.layout || 'horizontal';
  const position = settings?.position || 'top';
  const showLogo = settings?.showLogo ?? false;
  const showCTA = settings?.showCTAButton ?? false;
  const ctaText = settings?.ctaText || 'Get Started';
  const ctaUrl = settings?.ctaUrl || '#';

  const sortedPages = [...pages].sort((a, b) => a.sortOrder - b.sortOrder);

  const links = sortedPages.map(page => {
    const isActive = page.id === currentPageId;
    const color = isActive ? activeColor : navText;
    const fontWeight = isActive ? '700' : '400';
    const underline = isActive ? `border-bottom: 2px solid ${activeColor};` : '';
    return `            <a href="#page-${page.id}" style="color: ${color}; font-weight: ${fontWeight}; ${underline} text-decoration: none; padding: 8px 16px; font-size: 15px; font-family: 'Plus Jakarta Sans', sans-serif;">${page.title}</a>`;
  }).join('\n');

  const logoHTML = showLogo && settings?.logo
    ? `            <span style="font-size: 20px; font-weight: 800; color: ${navText}; font-family: 'Plus Jakarta Sans', sans-serif;">${settings.logo}</span>\n`
    : '';

  const ctaHTML = showCTA
    ? `            <a href="${ctaUrl}" style="background-color: ${activeColor}; color: #ffffff; padding: 8px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif;">${ctaText}</a>`
    : '';

  const isHorizontal = layout === 'horizontal';
  const flexDirection = isHorizontal ? 'row' : 'column';
  const alignItems = isHorizontal ? 'center' : 'stretch';

  let navPositionStyle = '';
  if (position === 'top') {
    navPositionStyle = 'position: fixed; top: 0; left: 0; right: 0; z-index: 9999; box-shadow: 0 1px 3px rgba(0,0,0,0.1);';
  } else if (position === 'left') {
    navPositionStyle = 'position: fixed; top: 0; left: 0; bottom: 0; z-index: 9999; box-shadow: 1px 0 3px rgba(0,0,0,0.1);';
  } else if (position === 'right') {
    navPositionStyle = 'position: fixed; top: 0; right: 0; bottom: 0; z-index: 9999; box-shadow: -1px 0 3px rgba(0,0,0,0.1);';
  }

  const navWidth = isHorizontal ? 'width: 100%;' : 'width: 220px;';

  return `    <nav style="background-color: ${navBg}; color: ${navText}; ${navPositionStyle} display: flex; flex-direction: ${flexDirection}; align-items: ${alignItems}; padding: 12px 24px; gap: 8px; ${navWidth} box-sizing: border-box;">
${logoHTML}${links}
${ctaHTML}
    </nav>`;
}

function generateMultiPageHTML(pages: Page[], navigationSettings?: NavigationSettings): string {
  const sortedPages = [...pages].sort((a, b) => a.sortOrder - b.sortOrder);
  const firstPageId = sortedPages[0]?.id || '';

  let cssRules = `
    .sec-wrapper { position: relative; width: 100%; overflow: hidden; }
    .sec-content { position: relative; width: 100%; max-width: 1024px; margin: 0 auto; height: 100%; }
    .responsive-el { position: absolute !important; transition: all 0.2s ease; }
    html { scroll-behavior: smooth; }
    body { padding-top: 56px; }
`;

  const renderedPageContents: string[] = [];

  sortedPages.forEach(page => {
    let sections = page.sections;
    
    // Handle case where sections is a string (from database)
    if (typeof sections === 'string') {
      try {
        sections = JSON.parse(sections);
      } catch (e) {
        console.error('Failed to parse sections from string:', e);
        sections = [];
      }
    }
    
    if (!Array.isArray(sections)) {
      console.warn(`Invalid sections for page ${page.id}:`, typeof sections, sections);
      sections = [];
    }

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
          if (el.type === 'video') {
            const parsed = parseVideoUrl((el as any).videoUrl || '');
            if (!parsed) {
              return `        <div ${idAttr} style="background-color: ${(el as any).bgColor || '#f1f5f9'}; border-radius: ${(el as any).borderRadius}; display: flex; align-items: center; justify-content: center; border: 2px dashed #cbd5e1;"><span style="color: #94a3b8; font-size: 11px;">Video URL not set</span></div>`;
            }
            const embedUrl = buildEmbedUrl(parsed, { autoplay: (el as any).autoplay, loop: (el as any).loop });
            const aspectRatio = (el as any).aspectRatio || '16:9';
            const ratioMap: Record<string, string> = { '16:9': '16/9', '4:3': '4/3', '1:1': '1/1' };
            return `        <div ${idAttr} style="width: 100%; aspect-ratio: ${ratioMap[aspectRatio] || '16/9'}; border-radius: ${(el as any).borderRadius}; overflow: hidden; background-color: ${(el as any).bgColor || '#000000'};"><iframe src="${embedUrl}" style="width: 100%; height: 100%; border: none;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
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

    renderedPageContents.push(`    <!-- Page: ${page.title} -->
    <div id="page-${page.id}">
${renderedSections}
    </div>`);
  });

  const navigation = generateNavigation(sortedPages, firstPageId, navigationSettings);

  return `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Multi-Page Site</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
${cssRules}
    </style>
</head>
<body class="bg-slate-50 font-sans antialiased text-slate-800 m-0 p-0 overflow-x-hidden">
${navigation}

${renderedPageContents.join('\n\n')}
</body>
</html>`;
}

export { generateFullHTML, generateNavigation, generateMultiPageHTML };
