import type { ElementCategory } from './block-types';
import { t } from './translations';

export interface CategoryDefinition {
  id: ElementCategory;
  labelKey: string;
  descriptionKey: string;
  icon: string;
  color: string;
}

export const ELEMENT_CATEGORIES: CategoryDefinition[] = [
  {
    id: 'text',
    labelKey: 'category.text.label',
    descriptionKey: 'category.text.description',
    icon: 'text',
    color: 'blue',
  },
  {
    id: 'interactive',
    labelKey: 'category.interactive.label',
    descriptionKey: 'category.interactive.description',
    icon: 'cursor',
    color: 'purple',
  },
  {
    id: 'media',
    labelKey: 'category.media.label',
    descriptionKey: 'category.media.description',
    icon: 'media',
    color: 'green',
  },
  {
    id: 'layout',
    labelKey: 'category.layout.label',
    descriptionKey: 'category.layout.description',
    icon: 'layoutGrid',
    color: 'orange',
  },
  {
    id: 'navigation',
    labelKey: 'category.navigation.label',
    descriptionKey: 'category.navigation.description',
    icon: 'navigation',
    color: 'indigo',
  },
  {
    id: 'forms',
    labelKey: 'category.forms.label',
    descriptionKey: 'category.forms.description',
    icon: 'form',
    color: 'pink',
  },
];

export const getCategoryLabel = (cat: CategoryDefinition) => t(cat.labelKey as any);
export const getCategoryDescription = (cat: CategoryDefinition) => t(cat.descriptionKey as any);
