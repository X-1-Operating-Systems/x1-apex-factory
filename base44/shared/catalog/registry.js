import { saas, agency } from './pack1.js';
import { localService, restaurant } from './pack2.js';
import { portfolio, commerce } from './pack3.js';
import { realEstate, clinic } from './pack4.js';
import { fitness, professional } from './pack5.js';
import { event, editorial } from './pack6.js';

const CATEGORIES = [saas, agency, localService, restaurant, portfolio, commerce, realEstate, clinic, fitness, professional, event, editorial];

// Ten section orders, so no two neighbouring templates in a category share a layout.
const RECIPES = [
  ['hero', 'stats', 'features', 'showcase', 'faq', 'cta', 'footer'],
  ['hero', 'features', 'gallery', 'showcase', 'faq', 'contact', 'footer'],
  ['hero', 'showcase', 'stats', 'pricing', 'faq', 'cta', 'footer'],
  ['hero', 'stats', 'gallery', 'features', 'text', 'contact', 'footer'],
  ['hero', 'features', 'pricing', 'showcase', 'faq', 'cta', 'footer'],
  ['hero', 'showcase', 'gallery', 'stats', 'features', 'contact', 'footer'],
  ['hero', 'stats', 'features', 'text', 'faq', 'cta', 'footer'],
  ['hero', 'gallery', 'features', 'showcase', 'pricing', 'contact', 'footer'],
  ['hero', 'features', 'stats', 'showcase', 'faq', 'text', 'cta', 'footer'],
  ['hero', 'showcase', 'features', 'gallery', 'pricing', 'faq', 'contact', 'footer'],
];

const FONTS = ['serif', 'display', 'sans'];

function blockProps(type, cfg, a, brand, i) {
  const img = cfg.images[i % cfg.images.length];
  const img2 = cfg.images[(i + 1) % cfg.images.length];
  const alt = `${brand} — ${a.eyebrow.toLowerCase()}`;

  switch (type) {
    case 'hero':
      return {
        eyebrow: a.eyebrow,
        title: a.title,
        subtitle: a.sub,
        primaryCta: a.cta.cta,
        secondaryCta: 'See the detail',
        image: img,
        imageAlt: alt,
      };
    case 'stats':
      return { items: a.stats.map(([value, label]) => ({ value, label })) };
    case 'features':
      return {
        eyebrow: a.eyebrow,
        title: 'What the work actually includes',
        items: a.features.map(([title, body]) => ({ title, body })),
      };
    case 'showcase':
      return {
        title: a.showcase.title,
        body: a.showcase.body,
        bullets: a.showcase.bullets,
        image: img2,
        imageAlt: `${brand} — ${a.showcase.title}`,
      };
    case 'gallery':
      return {
        title: `Inside ${brand}`,
        body: a.showcase.body,
        images: cfg.images,
        captions: [a.eyebrow, a.showcase.title, brand],
      };
    case 'pricing':
      return {
        title: 'Ways to work together',
        body: 'Fixed scope where it can be fixed, and a written number before anything starts.',
        plans: cfg.plans,
      };
    case 'faq':
      return {
        title: 'Questions we get asked',
        items: a.faq.map(([q, answer]) => ({ q, a: answer })),
      };
    case 'cta':
      return {
        title: a.cta.title,
        body: a.cta.body,
        cta: a.cta.cta,
        note: 'No obligation. A real reply within one working day.',
      };
    case 'contact':
      return {
        title: 'Start the conversation',
        body: a.cta.body,
        cta: a.cta.cta,
        placeholder: 'Tell us what you need and when you need it',
      };
    case 'text':
      return { title: a.text.title, body: a.text.body };
    case 'footer':
      return {
        brand,
        links: ['Home', 'Services', 'About', 'Contact'],
        note: `${brand}. All rights reserved.`,
      };
    default:
      return { title: brand, body: '' };
  }
}

export function buildCatalog() {
  const templates = [];

  CATEGORIES.forEach((cfg, categoryIndex) => {
    cfg.names.forEach((brand, i) => {
      const archetype = cfg.archetypes[i % cfg.archetypes.length];
      const recipe = RECIPES[i % RECIPES.length];

      templates.push({
        name: brand,
        category: cfg.category,
        tagline: archetype.sub.length > 96 ? `${archetype.sub.slice(0, 93)}…` : archetype.sub,
        description: archetype.text.body,
        tags: [cfg.category.replace('_', ' '), archetype.eyebrow.toLowerCase(), i % 7 === 5 ? 'dark' : 'light'],
        accent: cfg.accents[i % cfg.accents.length],
        surface: i % 7 === 5 ? 'dark' : 'light',
        headline_font: FONTS[i % FONTS.length],
        display_order: categoryIndex * 20 + i,
        blocks: recipe.map((type, b) => ({
          id: `${type}_${b}`,
          type,
          props: blockProps(type, cfg, archetype, brand, i),
        })),
      });
    });
  });

  return templates;
}

export const CATALOG_SIZE = CATEGORIES.reduce((sum, cfg) => sum + cfg.names.length, 0);