type TranslationKey =
  // Editor toolbar
  | 'editor.title'
  | 'editor.save'
  | 'editor.publish'
  | 'editor.undo'
  | 'editor.redo'
  | 'editor.preview'
  // Sidebar
  | 'sidebar.elements'
  | 'sidebar.sections'
  | 'sidebar.pages'
  | 'sidebar.settings'
  // Element catalog modal
  | 'elements.modal.title'
  | 'elements.modal.subtitle'
  | 'elements.modal.back'
  | 'elements.modal.close'
  | 'elements.modal.search_placeholder'
  | 'elements.modal.empty_category'
  | 'elements.modal.coming_soon'
  | 'elements.modal.click_to_insert'
  // Categories
  | 'category.text.label'
  | 'category.text.description'
  | 'category.interactive.label'
  | 'category.interactive.description'
  | 'category.media.label'
  | 'category.media.description'
  | 'category.layout.label'
  | 'category.layout.description'
  | 'category.navigation.label'
  | 'category.navigation.description'
  | 'category.forms.label'
  | 'category.forms.description'
  // Elements
  | 'element.heading.label'
  | 'element.heading.description'
  | 'element.paragraph.label'
  | 'element.paragraph.description'
  | 'element.button.label'
  | 'element.button.description'
  | 'element.badge.label'
  | 'element.badge.description'
  | 'element.image.label'
  | 'element.image.description'
  | 'element.card.label'
  | 'element.card.description'
  // Inspector
  | 'inspector.title'
  | 'inspector.no_selection'
  | 'inspector.position'
  | 'inspector.size'
  | 'inspector.style'
  | 'inspector.content'
  | 'inspector.delete'
  | 'inspector.duplicate'
  // Viewport
  | 'viewport.desktop'
  | 'viewport.tablet'
  | 'viewport.mobile'
  // Section templates
  | 'sections.modal.title'
  | 'sections.modal.subtitle'
  | 'sections.btn_add'
  | 'sections.category.header'
  | 'sections.category.content'
  | 'sections.category.social_proof'
  | 'sections.category.promotional'
  | 'sections.category.footer'
  | 'sections.category.basic'
  // Pages
  | 'pages.title'
  | 'pages.add_page'
  | 'pages.home'
  | 'pages.delete_confirm'
  // Toasts
  | 'toast.element_added'
  | 'toast.section_added'
  | 'toast.page_added'
  | 'toast.saved'
  | 'toast.published'
  | 'toast.error'
  | 'toast.deleted'
  | 'toast.duplicated'
  // Flyout headers
  | 'flyout.katalog_elemen'
  | 'flyout.struktur_seksi'
  | 'flyout.halaman_website'
  // Misc
  | 'misc.tip_click_element'
  | 'misc.tambah_ke_seksi'
  | 'misc.untitled_section'
  | 'misc.element'
  | 'misc.section'
  | 'misc.page'
  | 'misc.layers'
  | 'misc.settings'
  | 'misc.move_up'
  | 'misc.move_down'
  | 'misc.delete'
  | 'misc.drag_to_move'
  | 'misc.add_section_template';

const EN: Record<TranslationKey, string> = {
  // Editor toolbar
  'editor.title': 'Website Editor',
  'editor.save': 'Save',
  'editor.publish': 'Publish',
  'editor.undo': 'Undo',
  'editor.redo': 'Redo',
  'editor.preview': 'Preview',
  // Sidebar
  'sidebar.elements': 'Elements',
  'sidebar.sections': 'Sections',
  'sidebar.pages': 'Pages',
  'sidebar.settings': 'Settings',
  // Element catalog modal
  'elements.modal.title': 'Add Element',
  'elements.modal.subtitle': 'Choose a category to browse elements',
  'elements.modal.back': 'Back',
  'elements.modal.close': 'Close',
  'elements.modal.search_placeholder': 'Search elements...',
  'elements.modal.empty_category': 'No elements in this category yet',
  'elements.modal.coming_soon': 'Coming soon',
  'elements.modal.click_to_insert': 'Click to insert',
  // Categories
  'category.text.label': 'Text',
  'category.text.description': 'Headings, paragraphs, and text content',
  'category.interactive.label': 'Interactive',
  'category.interactive.description': 'Buttons, badges, and clickable elements',
  'category.media.label': 'Media',
  'category.media.description': 'Images, videos, and media content',
  'category.layout.label': 'Layout',
  'category.layout.description': 'Containers, cards, and structural elements',
  'category.navigation.label': 'Navigation',
  'category.navigation.description': 'Menus, breadcrumbs, and navigation elements',
  'category.forms.label': 'Forms',
  'category.forms.description': 'Inputs, textareas, and form controls',
  // Elements
  'element.heading.label': 'Heading',
  'element.heading.description': 'Main heading for sections',
  'element.paragraph.label': 'Paragraph',
  'element.paragraph.description': 'Body text and descriptions',
  'element.button.label': 'Button',
  'element.button.description': 'Call-to-action button',
  'element.badge.label': 'Badge',
  'element.badge.description': 'Label or tag element',
  'element.image.label': 'Image',
  'element.image.description': 'Image showcase',
  'element.card.label': 'Card',
  'element.card.description': 'Content card container',
  // Inspector
  'inspector.title': 'Inspector',
  'inspector.no_selection': 'No element selected',
  'inspector.position': 'Position',
  'inspector.size': 'Size',
  'inspector.style': 'Style',
  'inspector.content': 'Content',
  'inspector.delete': 'Delete',
  'inspector.duplicate': 'Duplicate',
  // Viewport
  'viewport.desktop': 'Desktop',
  'viewport.tablet': 'Tablet',
  'viewport.mobile': 'Mobile',
  // Section templates
  'sections.modal.title': 'Add Section',
  'sections.modal.subtitle': 'Choose a template to insert',
  'sections.btn_add': 'Add Section Template',
  'sections.category.header': 'Header / Banner',
  'sections.category.content': 'Content / Features',
  'sections.category.social_proof': 'Social Proof',
  'sections.category.promotional': 'Promotional',
  'sections.category.footer': 'Footer / Info',
  'sections.category.basic': 'Basic',
  // Pages
  'pages.title': 'Pages',
  'pages.add_page': 'Add Page',
  'pages.home': 'Home',
  'pages.delete_confirm': 'Delete this page?',
  // Toasts
  'toast.element_added': 'Element added',
  'toast.section_added': 'Section added',
  'toast.page_added': 'Page added',
  'toast.saved': 'Changes saved',
  'toast.published': 'Published successfully',
  'toast.error': 'Something went wrong',
  'toast.deleted': 'Deleted',
  'toast.duplicated': 'Duplicated',
  // Flyout headers
  'flyout.katalog_elemen': 'Element Catalog',
  'flyout.struktur_seksi': 'Section Structure',
  'flyout.halaman_website': 'Website Pages',
  // Misc
  'misc.tip_click_element': 'Click an element to insert into the active section in {viewport} mode.',
  'misc.tambah_ke_seksi': 'Add to section',
  'misc.untitled_section': 'Untitled Section',
  'misc.element': 'Element',
  'misc.section': 'Section',
  'misc.page': 'Page',
  'misc.layers': 'Layers',
  'misc.settings': 'Settings',
  'misc.move_up': 'Move up',
  'misc.move_down': 'Move down',
  'misc.delete': 'Delete',
  'misc.drag_to_move': 'Drag to move',
  'misc.add_section_template': 'Add Section Template',
};

export const t = (key: TranslationKey): string => {
  return EN[key] || key;
};

export type { TranslationKey };
