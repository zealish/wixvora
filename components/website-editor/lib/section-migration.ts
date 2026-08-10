// components/website-editor/lib/section-migration.ts

import type { Block, Section, ViewportLayout } from './block-types';
import { VIEWPORT_WIDTHS } from './viewport-utils';

function createId(prefix: string): string {
  return prefix + '_' + Math.random().toString(36).slice(2, 10);
}

/**
 * Create a ViewportLayout from legacy block properties.
 */
function createLayoutFromLegacy(
  x: number,
  y: number,
  width: number,
  height: number,
  hidden: boolean,
  viewport: 'desktop' | 'tablet' | 'mobile'
): ViewportLayout {
  if (viewport === 'desktop') {
    return { x, y, width, height, hidden };
  }

  const targetWidth = VIEWPORT_WIDTHS[viewport];
  const desktopWidth = VIEWPORT_WIDTHS.desktop;
  const ratio = targetWidth / desktopWidth;

  return {
    x: viewport === 'mobile' ? 20 : Math.max(20, Math.round(x * ratio)),
    y,
    width: Math.min(width, targetWidth - 40),
    height,
    hidden: false
  };
}

/**
 * Migrate old flat block array or object to new Section format.
 */
export function migrateToSectionFormat(oldData: any): { sections: Section[] } {
  const blocks: Block[] = Array.isArray(oldData) ? oldData : oldData.blocks || [];

  const migratedBlocks: Block[] = blocks.map(block => ({
    ...block,
    hidden: false,
    layouts: {
      desktop: createLayoutFromLegacy(
        block.x ?? 40,
        block.y ?? 40,
        block.width ?? 200,
        block.height ?? 100,
        block.hidden ?? false,
        'desktop'
      ),
      tablet: createLayoutFromLegacy(
        block.x ?? 40,
        block.y ?? 40,
        block.width ?? 200,
        block.height ?? 100,
        block.hidden ?? false,
        'tablet'
      ),
      mobile: createLayoutFromLegacy(
        block.x ?? 40,
        block.y ?? 40,
        block.width ?? 200,
        block.height ?? 100,
        block.hidden ?? false,
        'mobile'
      )
    }
  }));

  return {
    sections: [{
      id: createId('sec'),
      title: 'Migrated Content',
      bgColor: '#ffffff',
      bgGradient: '',
      heights: { desktop: 600, tablet: 600, mobile: 800 },
      blocks: migratedBlocks
    }]
  };
}

/**
 * Create default state with one empty section.
 */
export function createDefaultState(): { sections: Section[] } {
  return {
    sections: [{
      id: createId('sec'),
      title: 'Main Section',
      bgColor: '#ffffff',
      bgGradient: '',
      heights: { desktop: 600, tablet: 600, mobile: 800 },
      blocks: []
    }]
  };
}

/**
 * Auto-detect format and load editor state.
 */
export function loadEditorState(savedData: any): { sections: Section[] } {
  if (!savedData) {
    return createDefaultState();
  }

  // New format: already has sections
  if (savedData.sections && Array.isArray(savedData.sections)) {
    return { sections: savedData.sections };
  }

  // Old format: flat blocks array or blocks property
  if (Array.isArray(savedData) || savedData.blocks) {
    console.warn('[Migration] Converting old block format to section format');
    return migrateToSectionFormat(savedData);
  }

  return createDefaultState();
}
