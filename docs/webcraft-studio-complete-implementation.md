# Complete Implementation Guide - WebCraft Studio Pro Light Edition

Based on your HTML template (1765 lines), here's everything you need to implement inline editing across all components.

## ✅ Already Created Files

1. `/features/templates/components/block-editor/inline-text.tsx` - Core inline text editor component
2. `/features/templates/lib/block-catalog.ts` - All block definitions  
3. `/features/templates/components/block-editor/hooks/use-block-editor.ts` - State management hook
4. `/features/templates/components/block-editor/blocks/navbar-block.tsx` - Example implementation
5. `/features/templates/components/block-editor/blocks/heading-block.tsx` - Example implementation

## 📋 Remaining Components to Create

### Component 1: Paragraph Block
```typescript
// features/templates/components/block-editor/blocks/paragraph-block.tsx
"use client";

import type { ParagraphProps } from "../../../lib/block-types";
import { textAlignClass } from "../../../lib/block-types";
import { InlineText } from "../inline-text";

export function ParagraphBlock({ props }: { props: ParagraphProps }) {
  return (
    <div className="px-6 py-3">
      <p style={{ color: props.textColor }} className={`${props.fontSize} ${textAlignClass(props.align)} ${props.maxWidth} mx-auto leading-relaxed`}>
        <InlineText 
          value={props.text} 
          onChange={() => {}} 
          tagName="p"
          multiline={true}
        />
      </p>
    </div>
  );
}
```

### Component 2: Image Block
```typescript
// features/templates/components/block-editor/blocks/image-block.tsx
"use client";

import type { ImageProps } from "../../../lib/block-types";
import { InlineText } from "../inline-text";

export function ImageBlock({ props }: { props: ImageProps }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 text-center">
      <img src={props.url} alt={props.alt || "Visual"} className={`h-auto w-full ${props.rounded} ${props.shadow} mx-auto max-h-[480px] border border-slate-800 object-cover`} />
      {props.caption && (
        <p className="mt-2 text-xs text-slate-400">
          <InlineText value={props.caption} onChange={() => {}} tagName="span" />
        </p>
      )}
    </div>
  );
}
```

### Component 3: Container Block
```typescript
// features/templates/components/block-editor/blocks/container-block.tsx
"use client";

import type { ContainerProps } from "../../../lib/block-types";
import { InlineText } from "../inline-text";

export function ContainerBlock({ props }: { props: ContainerProps }) {
  return (
    <div style={{ backgroundColor: props.bgColor, color: props.textColor, borderColor: props.borderColor }} className={`${props.paddingY} ${props.paddingX} ${props.borderRadius} ${props.borderWidth} ${props.bgGradient} mx-auto my-4 max-w-6xl transition-all`}>
      <p className="text-sm leading-relaxed">
        <InlineText value={props.content} onChange={() => {}} tagName="span" multiline={true} />
      </p>
    </div>
  );
}
```

### Component 4: Grid Custom Block
```typescript
// features/templates/components/block-editor/blocks/grid-custom-block.tsx
"use client";

import type { GridCustomProps } from "../../../lib/block-types";
import { gridColsClass } from "../../../lib/block-types";
import { getBlockIcon } from "../../../lib/block-icons";
import { InlineText } from "../inline-text";

export function GridCustomBlock({ props }: { props: GridCustomProps }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-10 space-y-2 text-center">
        <h2 className="text-2xl font-extrabold text-white md:text-3xl">
          <InlineText value={props.title} onChange={() => {}} tagName="h2" />
        </h2>
        <p className="text-xs text-slate-400">
          <InlineText value={props.subtitle} onChange={() => {}} tagName="span" />
        </p>
      </div>
      <div className={`grid grid-cols-1 ${gridColsClass(props.columnsCount)} ${props.gap}`}>
        {props.columns.map((col, idx) => {
          const Icon = getBlockIcon(col.icon);
          return (
            <div key={idx} style={{ backgroundColor: col.bgColor, color: col.textColor }} className="flex flex-col justify-between rounded-2xl border border-slate-800/80 p-6 shadow-lg transition-all">
              <div>
                <div style={{ color: col.accentColor }} className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-lg">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-base font-bold">
                  <InlineText value={col.title} onChange={() => {}} tagName="h3" />
                </h3>
                <p className="mb-6 text-xs leading-relaxed opacity-80">
                  <InlineText value={col.desc} onChange={() => {}} tagName="span" multiline={true} />
                </p>
              </div>
              {col.btnText && (
                <a href={col.btnUrl || "#"} style={{ backgroundColor: col.accentColor }} className="inline-block w-full rounded-xl py-2.5 text-center text-xs font-semibold text-white shadow-md">
                  <InlineText value={col.btnText} onChange={() => {}} tagName="span" />
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### Component 5: Hero Block
```typescript
// features/templates/components/block-editor/blocks/hero-block.tsx
"use client";

import type { HeroProps } from "../../../lib/block-types";
import { justifyAlignClass, textAlignClass } from "../../../lib/block-types";
import { InlineText } from "../inline-text";

export function HeroBlock({ props }: { props: HeroProps }) {
  return (
    <div style={{ backgroundColor: props.bgColor, color: props.textColor }} className={`relative px-6 py-16 ${props.bgGradient} ${textAlignClass(props.align)} transition-all`}>
      <div className="mx-auto max-w-4xl space-y-5">
        {props.badge && (
          <span className="inline-block rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1 text-[11px] font-semibold text-blue-400">
            <InlineText value={props.badge} onChange={() => {}} tagName="span" />
          </span>
        )}
        <h1 className="text-3xl leading-tight font-extrabold tracking-tight md:text-5xl">
          <InlineText value={props.title} onChange={() => {}} tagName="h1" />
        </h1>
        <p className="mx-auto max-w-2xl text-sm opacity-80 md:text-base">
          <InlineText value={props.subtitle} onChange={() => {}} tagName="span" multiline={true} />
        </p>
        <div className={`flex flex-wrap pt-4 ${justifyAlignClass(props.align)} gap-4`}>
          {props.buttonText && (
            <a href={props.buttonUrl || "#"} className="inline-block rounded-xl bg-blue-600 px-6 py-3 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-500">
              <InlineText value={props.buttonText} onChange={() => {}} tagName="span" />
            </a>
          )}
          {props.secondaryButtonText && (
            <a href={props.secondaryButtonUrl || "#"} className="inline-block rounded-xl border border-slate-700 bg-slate-800 px-6 py-3 text-xs font-semibold text-slate-200 transition hover:bg-slate-700">
              <InlineText value={props.secondaryButtonText} onChange={() => {}} tagName="span" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Component 6: Pricing Block
```typescript
// features/templates/components/block-editor/blocks/pricing-block.tsx
"use client";

import { Check } from "lucide-react";
import type { PricingProps } from "../../../lib/block-types";
import { InlineText } from "../inline-text";

export function PricingBlock({ props }: { props: PricingProps }) {
  return (
    <div className="mx-auto max-w-sm px-6 py-10">
      <div style={{ backgroundColor: props.bgColor, color: props.textColor }} className="relative rounded-3xl border border-slate-800 p-8 text-center shadow-2xl">
        {props.badge && (
          <span style={{ backgroundColor: props.accentColor }} className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[10px] font-bold tracking-wider text-white uppercase">
            <InlineText value={props.badge} onChange={() => {}} tagName="span" />
          </span>
        )}
        <h3 className="mt-1 text-xl font-bold">
          <InlineText value={props.planName} onChange={() => {}} tagName="h3" />
        </h3>
        <div className="my-4">
          <span className="text-4xl font-extrabold">{props.price}</span>
          {props.period && <span className="ml-1 text-xs opacity-70">{props.period}</span>}
        </div>
        <ul className="my-6 space-y-2.5 border-t border-b border-slate-800/80 py-4 text-left">
          {props.features.map((f, i) => (
            <li key={i} className="flex items-center text-xs opacity-90">
              <Check className="mr-2 h-3.5 w-3.5 shrink-0 text-blue-400" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <a href={props.buttonUrl || "#"} style={{ backgroundColor: props.accentColor }} className="inline-block w-full rounded-xl py-3 text-center text-xs font-semibold text-white shadow-lg">
          <InlineText value={props.buttonText} onChange={() => {}} tagName="span" />
        </a>
      </div>
    </div>
  );
}
```

### Component 7: Form Contact Block
```typescript
// features/templates/components/block-editor/blocks/form-contact-block.tsx
"use client";

import type { FormContactProps } from "../../../lib/block-types";
import { InlineText } from "../inline-text";

export function FormContactBlock({ props }: { props: FormContactProps }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div style={{ backgroundColor: props.bgColor, color: props.textColor }} className="space-y-4 rounded-3xl border border-slate-800 p-8 text-center shadow-xl">
        <h3 className="text-xl font-bold">
          <InlineText value={props.title} onChange={() => {}} tagName="h3" />
        </h3>
        <p className="mx-auto max-w-md text-xs opacity-80">
          <InlineText value={props.subtitle} onChange={() => {}} tagName="span" multiline={true} />
        </p>
        <div className="mx-auto flex max-w-md flex-col gap-2 pt-2 sm:flex-row">
          <input type="email" placeholder={props.placeholder || "Enter your email address..."} className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500" />
          <button type="button" style={{ backgroundColor: props.accentColor }} className="shrink-0 rounded-xl px-5 py-2.5 text-xs font-semibold text-white">
            <InlineText value={props.buttonText} onChange={() => {}} tagName="span" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Component 8: Footer Block
```typescript
// features/templates/components/block-editor/blocks/footer-block.tsx
"use client";

import type { FooterProps } from "../../../lib/block-types";
import { InlineText } from "../inline-text";

export function FooterBlock({ props }: { props: FooterProps }) {
  return (
    <footer style={{ backgroundColor: props.bgColor, color: props.textColor }} className="space-y-2 border-t border-slate-800 px-6 py-8 text-center text-xs">
      <div className="text-sm font-bold">
        <InlineText value={props.brandName} onChange={() => {}} tagName="span" />
      </div>
      <p className="opacity-70">
        <InlineText value={props.copyright} onChange={() => {}} tagName="span" multiline={true} />
      </p>
    </footer>
  );
}
```

## 🎨 CSS Styles for globals.css

Add these light theme styles:

```css
/* @app/globals.css */

.editable-text-field {
  position: relative;
  outline: none;
  border-radius: 4px;
  transition: background-color 0.15s ease, box-shadow 0.15s ease;
}

.editable-text-field:hover:not([contenteditable="false"]) {
  background-color: rgba(37, 99, 235, 0.08);
  box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.25);
  cursor: text;
}

.editable-text-field:focus:not([contenteditable="false"]) {
  background-color: rgba(37, 99, 235, 0.12);
  box-shadow: 0 0 0 2px #2563eb;
}

.canvas-bg-grid {
  background-size: 28px 28px;
  background-image: radial-gradient(circle, rgba(15, 23, 42, 0.08) 1px, transparent 1px);
}

.block-outline {
  outline: 2px solid transparent;
  transition: all 0.15s ease-in-out;
}

.block-outline:hover {
  outline-color: #3b82f6;
}

.block-outline.is-selected {
  outline-color: #2563eb;
  outline-width: 2px;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
}
```

## 🔧 Database Integration

Your Drizzle schema already exists at `/lib/db/schema/templates.ts`. Use it like this:

```typescript
// features/templates/service.ts
import { db } from "@/lib/db/client";
import { templates } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function loadTemplate(templateId: string) {
  const result = await db.query.templates.findFirst({
    where: eq(templates.id, templateId),
  });
  
  if (!result) throw new Error("Template not found");
  
  return {
    id: result.id,
    name: result.name,
    blocks: result.blocksJson as any[],
    pageSettings: result.pageSettings as any,
  };
}

export async function saveTemplate(template: {
  id?: string;
  name: string;
  slug: string;
  blocks: any[];
  pageSettings: any;
  status: "draft" | "published";
}) {
  const htmlSnapshot = generateHTMLSnapshot(template.blocks);
  
  if (template.id) {
    await db.update(templates)
      .set({
        name: template.name,
        blocksJson: template.blocks,
        pageSettings: template.pageSettings,
        htmlSnapshot,
        updatedAt: new Date(),
      })
      .where(eq(templates.id, template.id));
  } else {
    await db.insert(templates).values({
      id: crypto.randomUUID(),
      name: template.name,
      slug: template.slug,
      blocksJson: template.blocks,
      pageSettings: template.pageSettings,
      htmlSnapshot,
      status: template.status,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
```

## 📝 Next Steps

1. **Create all remaining block components** (copy-paste the patterns above)
2. **Update BlockRenderer** to pass `onUpdate` callbacks to each block
3. **Add database service functions** (load/save templates)
4. **Update block-editor-page.tsx** to integrate with database
5. **Test inline editing** across all block types

All components now use the `InlineText` wrapper for seamless live editing!
