import { getLayout, getSectionHeight } from './viewport-utils';
import type { Element, Section, Page, NavigationSettings, ContainerLayout } from './block-types';
import { parseVideoUrl, buildEmbedUrl, getAutoThumbnail } from './video-url-parser';
import { generateVideoExportJS } from './video-export-js';

function buildContainerCSS(cl: ContainerLayout | undefined): string {
  if (!cl) return '';
  const parts: string[] = [`display:${cl.type === 'flex' ? 'flex' : 'grid'}`];
  if (cl.type === 'flex') {
    parts.push(`flex-direction:${cl.direction || 'row'}`);
    parts.push(`align-items:${cl.alignItems || 'start'}`);
    if (cl.justifyContent) parts.push(`justify-content:${cl.justifyContent}`);
  }
  if (cl.type === 'grid') parts.push(`grid-template-columns:repeat(${cl.columns || 3},1fr)`);
  parts.push(`gap:${cl.gap || 16}px`);
  return parts.join(';');
}

function isContainerType(type: string): boolean {
  return type === 'container' || type === 'flex-row' || type === 'grid';
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function collectAllElements(elements: Element[]): Element[] {
  const result: Element[] = [];
  for (const el of elements) { result.push(el); if (el.children?.length) result.push(...collectAllElements(el.children)); }
  return result;
}

function renderElementTree(el: Element, isChild: boolean): string {
  const hasChildren = el.children && el.children.length > 0;
  const isContainer = isContainerType(el.type);

  if (isContainer && hasChildren) {
    const containerCSS = buildContainerCSS(el.containerLayout);
    const styleParts = [
      containerCSS,
      el.bgColor ? `background-color:${el.bgColor}` : '',
      el.borderColor ? `border:1px solid ${el.borderColor}` : '',
      el.borderRadius ? `border-radius:${el.borderRadius}` : '',
      el.padding ? `padding:${el.padding}` : '',
      'box-sizing:border-box',
    ].filter(Boolean).join(';');
    const childrenHtml = el.children!.map((c) => renderElementTree(c, true)).join('');
    return `<div id="el-${el.id}" class="container-el" style="${styleParts}">${childrenHtml}</div>`;
  }

  if (isContainer && !hasChildren) return `<div id="el-${el.id}"></div>`;

  const idAttr = `id="el-${el.id}" class="${isChild ? '' : 'responsive-el'}"`;

  if (el.type === 'divider') {
    return `<hr ${idAttr} style="border:none;background:${el.dividerColor || '#e5e7eb'};height:${el.dividerHeight || '1px'};width:${el.dividerWidth || '100%'}">`;
  }
  if (el.type === 'spacer') return `<div ${idAttr}></div>`;
  if (el.type === 'icon-text') {
    const isHorizontal = el.iconTextLayout !== 'vertical';
    const iconSymbol = el.iconName === 'check' ? '✓' : el.iconName === 'mail' ? '✉' : el.iconName === 'sparkles' ? '✦' : '★';
    return `<div ${idAttr} class="icon-text-el" style="display:flex;flex-direction:${isHorizontal ? 'row' : 'column'};align-items:center;justify-content:center;gap:${isHorizontal ? '12px' : '8px'};text-align:${isHorizontal ? 'left' : 'center'};padding:8px"><span style="color:${el.iconColor || '#3b82f6'};font-size:${el.iconSize || '32'}px;flex-shrink:0">${iconSymbol}</span><div><div style="font-size:${el.fontSize || '16px'};font-weight:${el.fontWeight || '600'};color:${el.textColor || '#0f172a'}">${escapeHtml(el.title || 'Feature')}</div>${el.subtitle ? `<div style="font-size:14px;color:${el.descriptionColor || '#6b7280'};margin-top:4px">${escapeHtml(el.subtitle)}</div>` : ''}</div></div>`;
  }
  if (el.type === 'heading') {
    return `<h2 ${idAttr} style="color: ${el.textColor}; font-size: ${el.fontSize}; font-weight: ${el.fontWeight}; text-align: ${el.textAlign || 'left'};">${el.text}</h2>`;
  }
  if (el.type === 'paragraph') {
    return `<p ${idAttr} style="color: ${el.textColor}; font-size: ${el.fontSize}; font-weight: ${el.fontWeight}; text-align: ${el.textAlign || 'left'};">${el.text}</p>`;
  }
  if (el.type === 'button') {
    return `<a href="${el.url || '#'}" ${idAttr} style="background-color: ${el.bgColor}; color: ${el.textColor}; border-radius: ${el.borderRadius}; border: ${el.borderColor ? `1px solid ${el.borderColor}` : 'none'}; font-size: ${el.fontSize}; font-weight: ${el.fontWeight}; display: flex; align-items: center; justify-content: center; text-decoration: none;" class="shadow-md hover:opacity-90 transition">${el.text}</a>`;
  }
  if (el.type === 'badge') {
    return `<span ${idAttr} style="background-color: ${el.bgColor}; color: ${el.textColor}; border-radius: ${el.borderRadius}; border: 1px solid ${el.borderColor}; font-size: ${el.fontSize}; display: flex; align-items: center; justify-content: center; font-weight: 700;">${el.text}</span>`;
  }
  if (el.type === 'card') {
    return `<div ${idAttr} style="background-color: ${el.bgColor}; color: ${el.textColor}; border-radius: ${el.borderRadius}; border: 1px solid ${el.borderColor}; padding: 20px; box-sizing: border-box;" class="shadow-lg"><h3 style="color: ${el.accentColor}; margin: 0 0 8px 0; font-size: 18px; font-weight: 700;">${el.title}</h3><p style="margin: 0; font-size: 13px; opacity: 0.8; line-height: 1.5;">${el.subtitle}</p></div>`;
  }
  if (el.type === 'image') {
    const filterVal = imageFilterCSS(el);
    const linkTarget = el.linkUrl;
    const openNewTab = !!el.openInNewTab;
    const opaque = el.opacity ?? 1;
    const hasFilter = filterVal !== 'brightness(100%) contrast(100%) saturate(100%) blur(0px)';

    const imgTag = `<img src="${el.url}" alt="${el.alt || ''}" style="border-radius: ${el.borderRadius || '16px'}; object-fit: ${el.objectFit || 'cover'}; opacity: ${opaque}; filter: ${filterVal}; width: 100%; height: 100%;" onerror="this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f1f5f9;border:2px dashed #cbd5e1;border-radius:12px\\'><span style=\\'color:#94a3b8;font-size:11px;font-weight:600\\'>No image</span></div>'" />`;

    const innerHtml = linkTarget
      ? `<a href="${linkTarget}" ${openNewTab ? 'target="_blank" rel="noopener noreferrer"' : ''} style="display:block;width:100%;height:100%">${imgTag}</a>`
      : imgTag;

    const aspectRatioStyle = el.aspectRatio ? ` aspect-ratio: ${el.aspectRatio};` : '';
    const captionHtml = el.caption ? ` <div style="text-align:center;font-size:12px;color:#475569;margin-top:4px;line-height:1.4">${el.caption}</div>` : '';

    return `<div ${idAttr} style="border-radius: ${el.borderRadius || '16px'}; overflow: hidden;${aspectRatioStyle}" class="${hasFilter ? '' : ''}">${innerHtml}</div>${captionHtml}`;
  }
  if (el.type === 'video') {
    const parsed = parseVideoUrl(el.videoUrl || '');
    if (!parsed) {
      return `<div ${idAttr} style="background-color: ${el.bgColor || '#f1f5f9'}; border-radius: ${el.borderRadius}; display: flex; align-items: center; justify-content: center; border: 2px dashed #cbd5e1;"><span style="color: #94a3b8; font-size: 11px;">Video URL not set</span></div>`;
    }

    const thumbnailSrc = el.thumbnailUrl || getAutoThumbnail(parsed);
    const playStyle = el.playButtonStyle || 'circle';
    const overlayColor = el.overlayColor || 'rgba(0,0,0,0.3)';
    const videoAspectRatio = el.aspectRatio || '16:9';
    const ratioMap: Record<string, string> = { '16:9': '16/9', '4:3': '4/3', '1:1': '1/1' };
    const theme = el.controlBarTheme || 'dark';

    const playButtons: Record<string, string> = {
      circle: '<div class="vp-play-btn-static" style="width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,0.95);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.15);"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="color:#1e293b;margin-left:2px"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>',
      square: '<div class="vp-play-btn-static" style="width:56px;height:56px;border-radius:12px;background:rgba(255,255,255,0.95);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.15);"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style="color:#1e293b;margin-left:1px"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>',
      minimal: '<div class="vp-play-btn-static"><svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" style="color:white;filter:drop-shadow(0 2px 8px rgba(0,0,0,0.3))"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>',
    };

    if (el.autoplay) {
      const embedUrl = buildEmbedUrl(parsed, { autoplay: true, ...(el.loop !== undefined ? { loop: el.loop } : {}) });
      return `<div ${idAttr} style="width: 100%; aspect-ratio: ${ratioMap[videoAspectRatio] || '16/9'}; border-radius: ${el.borderRadius}; overflow: hidden; background-color: ${el.bgColor || '#000000'};"><iframe src="${embedUrl}&controls=0" style="width: 100%; height: 100%; border: none;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
    }

    return `<div ${idAttr} data-video-player data-video-id="${parsed.videoId}" data-video-provider="${parsed.provider}" data-video-theme="${theme}" style="width: 100%; aspect-ratio: ${ratioMap[videoAspectRatio] || '16/9'}; border-radius: ${el.borderRadius}; overflow: hidden; background-color: ${el.bgColor || '#000000'}; cursor: pointer; position: relative;"><img class="vp-thumbnail" src="${thumbnailSrc}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'"/><div class="vp-overlay" style="position:absolute;inset:0;background:${overlayColor}"></div><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)">${playButtons[playStyle]}</div></div>`;
  }
  return '';
}

function imageFilterCSS(el: Element): string {
  const b = el.filterBrightness ?? 100;
  const c = el.filterContrast ?? 100;
  const s = el.filterSaturation ?? 100;
  const bl = el.filterBlur ?? 0;
  return `brightness(${b}%) contrast(${c}%) saturate(${s}%) blur(${bl}px)`;
}

function imageHoverCSS(el: Element): string {
  const hover = el.hoverEffect;
  if (!hover || hover === 'none') return '';
  if (hover === 'zoom') return `#el-${el.id}:hover { transform: scale(1.05); }`;
  if (hover === 'grayscale-to-color') return `#el-${el.id} { filter: grayscale(100%); } #el-${el.id}:hover { filter: grayscale(0%); }`;
  return '';
}

function generateFullHTML(sections: Section[]): string {
  let cssRules = `
    .sec-wrapper { position: relative; width: 100%; overflow: hidden; }
    .sec-content { position: relative; width: 100%; max-width: 1024px; margin: 0 auto; height: 100%; }
    .responsive-el { position: absolute !important; transition: all 0.2s ease; }
    .container-el { box-sizing: border-box; }
    .icon-text-el { word-break: break-word; }
`;

  sections.forEach(sec => {
    const deskH = getSectionHeight(sec, 'desktop');
    const tabH = getSectionHeight(sec, 'tablet');
    const mobH = getSectionHeight(sec, 'mobile');

    cssRules += `    #sec-${sec.id} { height: ${deskH}px; }\n`;

    collectAllElements(sec.elements).forEach(el => {
      const d = getLayout(el, 'desktop');
      cssRules += `    #el-${el.id} { left: ${d.x}px; top: ${d.y}px; width: ${d.width}px; height: ${d.height}px; z-index: ${el.zIndex || 10}; display: ${d.hidden ? 'none' : 'block'}; }\n`;
    });

    cssRules += `\n    @media (max-width: 1023px) {\n`;
    cssRules += `      #sec-${sec.id} { height: ${tabH}px; }\n`;
    collectAllElements(sec.elements).forEach(el => {
      const t = getLayout(el, 'tablet');
      cssRules += `      #el-${el.id} { left: ${t.x}px; top: ${t.y}px; width: ${t.width}px; height: ${t.height}px; display: ${t.hidden ? 'none' : 'block'}; }\n`;
    });
    cssRules += `    }\n`;

    cssRules += `\n    @media (max-width: 639px) {\n`;
    cssRules += `      #sec-${sec.id} { height: ${mobH}px; }\n`;
    collectAllElements(sec.elements).forEach(el => {
      const m = getLayout(el, 'mobile');
      cssRules += `      #el-${el.id} { left: ${m.x}px; top: ${m.y}px; width: ${m.width}px; height: ${m.height}px; display: ${m.hidden ? 'none' : 'block'}; }\n`;
    });
    cssRules += `    }\n\n`;
  });

  sections.forEach(sec => {
    collectAllElements(sec.elements).forEach(el => {
      if (el.type === 'image') {
        const hoverCss = imageHoverCSS(el);
        if (hoverCss) {
          cssRules += `    ${hoverCss}\n`;
        }
      }
    });
  });

  const renderedSections = sections.map(sec => {
    const renderedElements = sec.elements.map(el => `        ${renderElementTree(el, false)}`).join('\n');

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
${generateVideoExportJS()}
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
    .container-el { box-sizing: border-box; }
    .icon-text-el { word-break: break-word; }
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
        // eslint-disable-next-line no-console
        console.error('Failed to parse sections from string:', e);
        sections = [];
      }
    }
    
    if (!Array.isArray(sections)) {
      // eslint-disable-next-line no-console
      console.warn(`Invalid sections for page ${page.id}:`, typeof sections, sections);
      sections = [];
    }

    sections.forEach(sec => {
      const deskH = getSectionHeight(sec, 'desktop');
      const tabH = getSectionHeight(sec, 'tablet');
      const mobH = getSectionHeight(sec, 'mobile');

      cssRules += `    #sec-${sec.id} { height: ${deskH}px; }\n`;

      collectAllElements(sec.elements).forEach(el => {
        const d = getLayout(el, 'desktop');
        cssRules += `    #el-${el.id} { left: ${d.x}px; top: ${d.y}px; width: ${d.width}px; height: ${d.height}px; z-index: ${el.zIndex || 10}; display: ${d.hidden ? 'none' : 'block'}; }\n`;
      });

      cssRules += `\n    @media (max-width: 1023px) {\n`;
      cssRules += `      #sec-${sec.id} { height: ${tabH}px; }\n`;
      collectAllElements(sec.elements).forEach(el => {
        const t = getLayout(el, 'tablet');
        cssRules += `      #el-${el.id} { left: ${t.x}px; top: ${t.y}px; width: ${t.width}px; height: ${t.height}px; display: ${t.hidden ? 'none' : 'block'}; }\n`;
      });
      cssRules += `    }\n`;

      cssRules += `\n    @media (max-width: 639px) {\n`;
      cssRules += `      #sec-${sec.id} { height: ${mobH}px; }\n`;
      collectAllElements(sec.elements).forEach(el => {
        const m = getLayout(el, 'mobile');
        cssRules += `      #el-${el.id} { left: ${m.x}px; top: ${m.y}px; width: ${m.width}px; height: ${m.height}px; display: ${m.hidden ? 'none' : 'block'}; }\n`;
      });
      cssRules += `    }\n\n`;
    });

    sections.forEach(sec => {
      collectAllElements(sec.elements).forEach(el => {
        if (el.type === 'image') {
          const hoverCss = imageHoverCSS(el);
          if (hoverCss) {
            cssRules += `    ${hoverCss}\n`;
          }
        }
      });
    });

    const renderedSections = sections.map(sec => {
      const renderedElements = sec.elements.map(el => `        ${renderElementTree(el, false)}`).join('\n');

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
${generateVideoExportJS()}
</body>
</html>`;
}

export { generateFullHTML, generateNavigation, generateMultiPageHTML };
