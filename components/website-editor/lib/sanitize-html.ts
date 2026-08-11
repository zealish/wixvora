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

const FONT_SIZE_REGEX = /font-size:\s*\d+px/g;

function sanitizeStyleAttribute(style: string): string {
  if (!style) return "";

  const matches = style.match(FONT_SIZE_REGEX);
  if (matches) {
    return matches.join("; ");
  }

  return "";
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
