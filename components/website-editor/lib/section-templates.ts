import type { Section } from './block-types';
import { t } from './translations';

function createId(prefix: string): string {
  return prefix + '_' + Math.random().toString(36).slice(2, 10);
}

export interface SectionTemplate {
  id: string;
  title: string;
  category: string;
  desc: string;
  previewBg: string;
  factory: () => Section;
}

export const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    id: 'hero',
    title: 'Hero Strip Section',
    category: t('sections.category.header'),
    desc: 'Stunning hero section with large heading, subtitle, CTA button, and illustration image.',
    previewBg: 'bg-gradient-to-r from-blue-600 to-indigo-700',
    factory: () => ({
      id: createId('sec'),
      title: 'Main Hero Banner',
      heights: { desktop: 480, tablet: 460, mobile: 640 },
      bgColor: '#ffffff',
      bgGradient: 'bg-gradient-to-r from-blue-50 via-slate-50 to-indigo-50',
      elements: [
        {
          id: createId('el'),
          type: 'badge',
          name: 'Badge Banner',
          layouts: {
            desktop: { x: 60, y: 40, width: 250, height: 34, hidden: false },
            tablet: { x: 40, y: 30, width: 240, height: 32, hidden: false },
            mobile: { x: 20, y: 20, width: 230, height: 32, hidden: false }
          },
          zIndex: 10,
          text: '🚀 WEBCRAFT STUDIO PRO',
          bgColor: '#eff6ff',
          textColor: '#1d4ed8',
          borderColor: '#93c5fd',
          borderRadius: '9999px',
          fontSize: '11px'
        },
        {
          id: createId('el'),
          type: 'heading',
          name: 'Hero Main Title',
          layouts: {
            desktop: { x: 60, y: 90, width: 580, height: 100, hidden: false },
            tablet: { x: 40, y: 75, width: 440, height: 100, hidden: false },
            mobile: { x: 20, y: 65, width: 335, height: 110, hidden: false }
          },
          zIndex: 10,
          text: 'Persistent Layout For Desktop, Tablet & Mobile',
          fontSize: '36px',
          fontWeight: '800',
          textColor: '#0f172a',
          textAlign: 'left'
        },
        {
          id: createId('el'),
          type: 'paragraph',
          name: 'Hero Subtitle',
          layouts: {
            desktop: { x: 60, y: 200, width: 520, height: 70, hidden: false },
            tablet: { x: 40, y: 185, width: 430, height: 80, hidden: false },
            mobile: { x: 20, y: 185, width: 335, height: 110, hidden: false }
          },
          zIndex: 10,
          text: 'Moving items in Desktop mode won\'t change the Mobile layout! Switch between screens to adjust the layout.',
          fontSize: '15px',
          fontWeight: '400',
          textColor: '#475569',
          textAlign: 'left'
        },
        {
          id: createId('el'),
          type: 'button',
          name: 'Primary Button',
          layouts: {
            desktop: { x: 60, y: 290, width: 190, height: 48, hidden: false },
            tablet: { x: 40, y: 280, width: 180, height: 46, hidden: false },
            mobile: { x: 20, y: 305, width: 335, height: 48, hidden: false }
          },
          zIndex: 12,
          text: '🔥 Get Started Now',
          url: '#',
          bgColor: '#2563eb',
          textColor: '#ffffff',
          borderRadius: '12px',
          fontSize: '14px',
          fontWeight: '600'
        },
        {
          id: createId('el'),
          type: 'image',
          name: 'Hero Image',
          layouts: {
            desktop: { x: 670, y: 50, width: 320, height: 320, hidden: false },
            tablet: { x: 480, y: 75, width: 250, height: 250, hidden: false },
            mobile: { x: 20, y: 375, width: 335, height: 220, hidden: false }
          },
          zIndex: 8,
          url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
          borderRadius: '24px'
        }
      ]
    })
  },
  {
    id: 'features',
    title: 'Key Features (3 Columns)',
    category: t('sections.category.content'),
    desc: '3-column grid with icon+text feature cards showing nested layout capabilities.',
    previewBg: 'bg-emerald-600',
    factory: () => ({
      id: createId('sec'),
      title: 'Featured Benefits',
      heights: { desktop: 420, tablet: 420, mobile: 820 },
      bgColor: '#f8fafc',
      bgGradient: '',
      elements: [
        {
          id: createId('el'),
          type: 'heading',
          name: 'Features Section Title',
          layouts: {
            desktop: { x: 60, y: 40, width: 880, height: 50, hidden: false },
            tablet: { x: 40, y: 30, width: 688, height: 50, hidden: false },
            mobile: { x: 20, y: 20, width: 335, height: 60, hidden: false }
          },
          zIndex: 10,
          text: 'One Component, Multiple Layouts Per Screen',
          fontSize: '28px',
          fontWeight: '800',
          textColor: '#0f172a',
          textAlign: 'center'
        },
        {
          id: createId('el'),
          type: 'grid',
          name: 'Features Grid Container',
          layouts: {
            desktop: { x: 60, y: 120, width: 880, height: 260, hidden: false },
            tablet: { x: 40, y: 110, width: 688, height: 260, hidden: false },
            mobile: { x: 20, y: 90, width: 335, height: 700, hidden: false }
          },
          zIndex: 5,
          containerLayout: {
            type: 'grid',
            columns: 3,
            gap: 24,
            alignItems: 'start'
          },
          bgColor: 'transparent',
          padding: '0px',
          children: [
            {
              id: createId('el'),
              type: 'icon-text',
              name: 'Feature 1',
              layouts: {
                desktop: { x: 0, y: 0, width: 100, height: 100, hidden: false },
                tablet: { x: 0, y: 0, width: 100, height: 100, hidden: false },
                mobile: { x: 0, y: 0, width: 100, height: 100, hidden: false }
              },
              zIndex: 1,
              iconName: 'monitor',
              iconColor: '#2563eb',
              iconSize: '40',
              iconTextLayout: 'vertical',
              title: 'Desktop Persistence',
              subtitle: 'Set ideal layout for wide screens with pixel-precise positioning freedom.',
              textColor: '#0f172a',
              fontSize: '18px',
              fontWeight: '600'
            },
            {
              id: createId('el'),
              type: 'icon-text',
              name: 'Feature 2',
              layouts: {
                desktop: { x: 0, y: 0, width: 100, height: 100, hidden: false },
                tablet: { x: 0, y: 0, width: 100, height: 100, hidden: false },
                mobile: { x: 0, y: 0, width: 100, height: 100, hidden: false }
              },
              zIndex: 1,
              iconName: 'tablet',
              iconColor: '#10b981',
              iconSize: '40',
              iconTextLayout: 'vertical',
              title: 'Tablet Adaption',
              subtitle: 'Adjust coordinates to be proportional on tablets or medium screens.',
              textColor: '#0f172a',
              fontSize: '18px',
              fontWeight: '600'
            },
            {
              id: createId('el'),
              type: 'icon-text',
              name: 'Feature 3',
              layouts: {
                desktop: { x: 0, y: 0, width: 100, height: 100, hidden: false },
                tablet: { x: 0, y: 0, width: 100, height: 100, hidden: false },
                mobile: { x: 0, y: 0, width: 100, height: 100, hidden: false }
              },
              zIndex: 1,
              iconName: 'smartphone',
              iconColor: '#f59e0b',
              iconSize: '40',
              iconTextLayout: 'vertical',
              title: 'Mobile Optimization',
              subtitle: 'Rearrange vertically for smartphones without affecting the desktop version.',
              textColor: '#0f172a',
              fontSize: '18px',
              fontWeight: '600'
            }
          ]
        }
      ]
    })
  },
  {
    id: 'testimonials',
    title: 'Testimonials & Reviews',
    category: t('sections.category.social_proof'),
    desc: 'Customer appreciation quotes with profile photos and elegant card design.',
    previewBg: 'bg-amber-600',
    factory: () => ({
      id: createId('sec'),
      title: 'Customer Reviews',
      heights: { desktop: 380, tablet: 400, mobile: 620 },
      bgColor: '#ffffff',
      bgGradient: '',
      elements: [
        {
          id: createId('el'),
          type: 'heading',
          name: 'Testimonial Title',
          layouts: {
            desktop: { x: 60, y: 40, width: 900, height: 50, hidden: false },
            tablet: { x: 40, y: 30, width: 688, height: 50, hidden: false },
            mobile: { x: 20, y: 20, width: 335, height: 60, hidden: false }
          },
          zIndex: 10,
          text: 'Trusted By Thousands of Designers',
          fontSize: '28px',
          fontWeight: '800',
          textColor: '#0f172a',
          textAlign: 'center'
        },
        {
          id: createId('el'),
          type: 'card',
          name: 'Testimonial Card 1',
          layouts: {
            desktop: { x: 120, y: 110, width: 380, height: 210, hidden: false },
            tablet: { x: 40, y: 100, width: 330, height: 220, hidden: false },
            mobile: { x: 20, y: 90, width: 335, height: 230, hidden: false }
          },
          zIndex: 5,
          title: '⭐⭐⭐⭐⭐ "Incredibly Fast!"',
          subtitle: '"WebCraft Studio transformed our landing page workflow. Very intuitive and the code output is clean!" - Sarah J., UI/UX Lead',
          bgColor: '#f8fafc',
          textColor: '#1e293b',
          borderColor: '#e2e8f0',
          borderRadius: '20px',
          accentColor: '#0284c7'
        },
        {
          id: createId('el'),
          type: 'card',
          name: 'Testimonial Card 2',
          layouts: {
            desktop: { x: 530, y: 110, width: 380, height: 210, hidden: false },
            tablet: { x: 395, y: 100, width: 330, height: 220, hidden: false },
            mobile: { x: 20, y: 340, width: 335, height: 230, hidden: false }
          },
          zIndex: 5,
          title: '⭐⭐⭐⭐⭐ "Truly Responsive"',
          subtitle: '"The separate layout per viewport feature is the answer to responsive DnD problems. Totally worth it!" - Budi Pratama, Web Dev',
          bgColor: '#f8fafc',
          textColor: '#1e293b',
          borderColor: '#e2e8f0',
          borderRadius: '20px',
          accentColor: '#e11d48'
        }
      ]
    })
  },
  {
    id: 'cta_banner',
    title: 'Call to Action Banner',
    category: t('sections.category.promotional'),
    desc: 'Eye-catching closing strip to drive conversions with prominent action button.',
    previewBg: 'bg-indigo-600',
    factory: () => ({
      id: createId('sec'),
      title: 'Call to Action Banner',
      heights: { desktop: 320, tablet: 320, mobile: 420 },
      bgColor: '#2563eb',
      bgGradient: 'bg-gradient-to-r from-blue-600 to-indigo-700',
      elements: [
        {
          id: createId('el'),
          type: 'heading',
          name: 'CTA Title',
          layouts: {
            desktop: { x: 100, y: 60, width: 824, height: 60, hidden: false },
            tablet: { x: 50, y: 50, width: 668, height: 60, hidden: false },
            mobile: { x: 20, y: 30, width: 335, height: 80, hidden: false }
          },
          zIndex: 10,
          text: 'Ready To Build Your Dream Website?',
          fontSize: '32px',
          fontWeight: '800',
          textColor: '#ffffff',
          textAlign: 'center'
        },
        {
          id: createId('el'),
          type: 'paragraph',
          name: 'CTA Subtext',
          layouts: {
            desktop: { x: 200, y: 130, width: 624, height: 50, hidden: false },
            tablet: { x: 100, y: 120, width: 568, height: 50, hidden: false },
            mobile: { x: 20, y: 120, width: 335, height: 80, hidden: false }
          },
          zIndex: 10,
          text: 'Use WebCraft Studio Pro now and create responsive landing pages in minutes.',
          fontSize: '15px',
          fontWeight: '400',
          textColor: '#bfdbfe',
          textAlign: 'center'
        },
        {
          id: createId('el'),
          type: 'button',
          name: 'CTA Action Button',
          layouts: {
            desktop: { x: 412, y: 200, width: 200, height: 50, hidden: false },
            tablet: { x: 284, y: 190, width: 200, height: 50, hidden: false },
            mobile: { x: 20, y: 220, width: 335, height: 50, hidden: false }
          },
          zIndex: 12,
          text: '🚀 Try Free Now',
          url: '#',
          bgColor: '#ffffff',
          textColor: '#1d4ed8',
          borderRadius: '14px',
          fontSize: '14px',
          fontWeight: '700'
        }
      ]
    })
  },
  {
    id: 'contact_info',
    title: 'Contact & Address',
    category: t('sections.category.footer'),
    desc: 'Contact information layout, simple form, and business location address.',
    previewBg: 'bg-purple-600',
    factory: () => ({
      id: createId('sec'),
      title: 'Contact Us',
      heights: { desktop: 400, tablet: 420, mobile: 650 },
      bgColor: '#ffffff',
      bgGradient: '',
      elements: [
        {
          id: createId('el'),
          type: 'heading',
          name: 'Contact Title',
          layouts: {
            desktop: { x: 60, y: 40, width: 450, height: 50, hidden: false },
            tablet: { x: 40, y: 30, width: 400, height: 50, hidden: false },
            mobile: { x: 20, y: 20, width: 335, height: 60, hidden: false }
          },
          zIndex: 10,
          text: 'Let\'s Discuss Your Project',
          fontSize: '28px',
          fontWeight: '800',
          textColor: '#0f172a'
        },
        {
          id: createId('el'),
          type: 'paragraph',
          name: 'Contact Description',
          layouts: {
            desktop: { x: 60, y: 100, width: 420, height: 90, hidden: false },
            tablet: { x: 40, y: 90, width: 380, height: 100, hidden: false },
            mobile: { x: 20, y: 90, width: 335, height: 110, hidden: false }
          },
          zIndex: 10,
          text: 'Our team is ready to help realize your web design concept. Contact us via email or visit our studio.',
          fontSize: '14px',
          fontWeight: '400',
          textColor: '#64748b'
        },
        {
          id: createId('el'),
          type: 'card',
          name: 'Contact Info Box',
          layouts: {
            desktop: { x: 60, y: 210, width: 420, height: 140, hidden: false },
            tablet: { x: 40, y: 200, width: 380, height: 150, hidden: false },
            mobile: { x: 20, y: 210, width: 335, height: 160, hidden: false }
          },
          zIndex: 5,
          title: '📍 Studio Utama',
          subtitle: 'Jakarta South Quarter, Tower A Lt 12, Jakarta Selatan. Email: halo@webcraftstudio.com | WA: +62 812-3456-7890',
          bgColor: '#f8fafc',
          textColor: '#1e293b',
          borderColor: '#e2e8f0',
          borderRadius: '16px',
          accentColor: '#2563eb'
        },
        {
          id: createId('el'),
          type: 'image',
          name: 'Map Image',
          layouts: {
            desktop: { x: 530, y: 40, width: 430, height: 310, hidden: false },
            tablet: { x: 440, y: 40, width: 290, height: 310, hidden: false },
            mobile: { x: 20, y: 390, width: 335, height: 220, hidden: false }
          },
          zIndex: 8,
          url: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80',
          borderRadius: '20px'
        }
      ]
    })
  },
  {
    id: 'blank',
    title: 'Blank Section (Empty Strip)',
    category: t('sections.category.basic'),
    desc: 'Clean section with no elements to build layout from scratch.',
    previewBg: 'bg-slate-200',
    factory: () => ({
      id: createId('sec'),
      title: 'New Blank Section',
      heights: { desktop: 400, tablet: 400, mobile: 500 },
      bgColor: '#ffffff',
      bgGradient: '',
      elements: []
    })
  },
  {
    id: 'navigation',
    title: 'Navigation Bar',
    category: t('sections.category.header'),
    desc: 'Responsive navigation with logo, menu links, and CTA button.',
    previewBg: 'bg-sky-600',
    factory: () => ({
      id: createId('sec'),
      title: 'Navigation Bar',
      heights: { desktop: 72, tablet: 64, mobile: 56 },
      bgColor: '#ffffff',
      bgGradient: '',
      elements: [
        {
          id: createId('el'),
          type: 'heading',
          name: 'Logo',
          layouts: {
            desktop: { x: 40, y: 18, width: 160, height: 36, hidden: false },
            tablet: { x: 24, y: 14, width: 140, height: 36, hidden: false },
            mobile: { x: 16, y: 10, width: 120, height: 36, hidden: false }
          },
          zIndex: 10,
          text: 'YourBrand',
          fontSize: '22px',
          fontWeight: '700',
          textColor: '#0f172a',
          textAlign: 'left'
        },
        {
          id: createId('el'),
          type: 'button',
          name: 'Nav Link Home',
          layouts: {
            desktop: { x: 360, y: 20, width: 70, height: 32, hidden: false },
            tablet: { x: 220, y: 16, width: 60, height: 30, hidden: false },
            mobile: { x: 16, y: 60, width: 80, height: 30, hidden: false }
          },
          zIndex: 10,
          text: 'Home',
          url: '#',
          bgColor: 'transparent',
          textColor: '#334155',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '500'
        },
        {
          id: createId('el'),
          type: 'button',
          name: 'Nav Link About',
          layouts: {
            desktop: { x: 440, y: 20, width: 70, height: 32, hidden: false },
            tablet: { x: 290, y: 16, width: 60, height: 30, hidden: false },
            mobile: { x: 110, y: 60, width: 80, height: 30, hidden: false }
          },
          zIndex: 10,
          text: 'About',
          url: '#',
          bgColor: 'transparent',
          textColor: '#334155',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '500'
        },
        {
          id: createId('el'),
          type: 'button',
          name: 'Nav Link Services',
          layouts: {
            desktop: { x: 520, y: 20, width: 80, height: 32, hidden: false },
            tablet: { x: 360, y: 16, width: 72, height: 30, hidden: false },
            mobile: { x: 16, y: 100, width: 80, height: 30, hidden: false }
          },
          zIndex: 10,
          text: 'Services',
          url: '#',
          bgColor: 'transparent',
          textColor: '#334155',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '500'
        },
        {
          id: createId('el'),
          type: 'button',
          name: 'Nav Link Contact',
          layouts: {
            desktop: { x: 610, y: 20, width: 80, height: 32, hidden: false },
            tablet: { x: 442, y: 16, width: 72, height: 30, hidden: false },
            mobile: { x: 110, y: 100, width: 80, height: 30, hidden: false }
          },
          zIndex: 10,
          text: 'Contact',
          url: '#',
          bgColor: 'transparent',
          textColor: '#334155',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '500'
        },
        {
          id: createId('el'),
          type: 'button',
          name: 'CTA Button',
          layouts: {
            desktop: { x: 820, y: 16, width: 140, height: 40, hidden: false },
            tablet: { x: 568, y: 12, width: 120, height: 40, hidden: false },
            mobile: { x: 16, y: 140, width: 160, height: 40, hidden: false }
          },
          zIndex: 12,
          text: 'Get Started',
          url: '#',
          bgColor: '#2563eb',
          textColor: '#ffffff',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600'
        }
      ]
    })
  }
];
