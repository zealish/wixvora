import DOMPurify from "dompurify";

const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "u", "s", "a", "code", "pre",
  "blockquote", "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "span",
];

const ALLOWED_ATTRS: Record<string, string[]> = {
  a: ["href"],
  span: ["style"],
};

const FONT_SIZE_REGEX = /font-size:\s*(\d+)px/;
const COLOR_REGEX = /(?:^|;|\s)color:\s*(#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}))(?:;|$|\s)/;
const BACKGROUND_COLOR_REGEX = /background-color:\s*(#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}))(?:;|$|\s)/;

const MIN_FONT_SIZE = 8;
const MAX_FONT_SIZE = 200;

function sanitizeStyleAttribute(style: string): string {
  if (!style) return "";

  const sanitizedStyles: string[] = [];

  const fontSizeMatch = style.match(FONT_SIZE_REGEX);
  if (fontSizeMatch && fontSizeMatch[1]) {
    const size = parseInt(fontSizeMatch[1], 10);
    if (size >= MIN_FONT_SIZE && size <= MAX_FONT_SIZE) {
      sanitizedStyles.push(`font-size: ${size}px`);
    }
  }

  const colorMatch = style.match(COLOR_REGEX);
  if (colorMatch) {
    sanitizedStyles.push(`color: ${colorMatch[1]}`);
  }

  const backgroundColorMatch = style.match(BACKGROUND_COLOR_REGEX);
  if (backgroundColorMatch) {
    sanitizedStyles.push(`background-color: ${backgroundColorMatch[1]}`);
  }

  return sanitizedStyles.join("; ");
}

export function sanitizeHtml(html: string): string {
  if (!html) return "";

  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: Object.values(ALLOWED_ATTRS).flat(),
  });

  const div = document.createElement("div");
  div.innerHTML = clean;

  div.querySelectorAll("span[style]").forEach((span) => {
    const originalStyle = span.getAttribute("style") || "";
    const sanitizedStyle = sanitizeStyleAttribute(originalStyle);

    if (sanitizedStyle) {
      span.setAttribute("style", sanitizedStyle);
    } else {
      span.removeAttribute("style");
    }
  });

  return div.innerHTML;
}
