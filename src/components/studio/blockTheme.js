import React from 'react';

export const FONTS = {
  serif: 'Georgia, "Fraunces", "Times New Roman", serif',
  display: '"Fraunces", Georgia, serif',
  sans: '"Inter", ui-sans-serif, system-ui, sans-serif',
};

export function surfaceTheme(surface = 'light') {
  return surface === 'dark'
    ? { bg: '#0f0e0d', fg: '#f5f1ea', muted: '#a79e93', card: '#191715', line: 'rgba(255,255,255,0.11)', soft: '#141211' }
    : { bg: '#fbf9f6', fg: '#161310', muted: '#6d655b', card: '#ffffff', line: 'rgba(22,19,16,0.10)', soft: '#f2ede6' };
}

export const PAD = 'clamp(26px, 6cqw, 88px)';
export const GAP = 'clamp(20px, 4cqw, 56px)';

export const t = {
  eyebrow: {
    fontSize: 'clamp(0.6rem, 0.92cqw, 0.72rem)',
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    fontWeight: 600,
    fontFamily: FONTS.sans,
  },
  h1: {
    fontSize: 'clamp(2rem, 6.2cqw, 4.4rem)',
    lineHeight: 1.0,
    letterSpacing: '-0.035em',
    fontWeight: 400,
    margin: 0,
  },
  h2: {
    fontSize: 'clamp(1.45rem, 3.5cqw, 2.6rem)',
    lineHeight: 1.06,
    letterSpacing: '-0.028em',
    fontWeight: 400,
    margin: 0,
  },
  h3: {
    fontSize: 'clamp(1rem, 1.7cqw, 1.2rem)',
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
    fontWeight: 600,
    margin: 0,
    fontFamily: FONTS.sans,
  },
  lead: {
    fontSize: 'clamp(0.95rem, 1.55cqw, 1.18rem)',
    lineHeight: 1.6,
    fontWeight: 400,
  },
  body: {
    fontSize: 'clamp(0.84rem, 1.2cqw, 0.97rem)',
    lineHeight: 1.65,
    fontWeight: 400,
  },
  small: {
    fontSize: 'clamp(0.7rem, 0.95cqw, 0.8rem)',
    lineHeight: 1.5,
    fontFamily: FONTS.sans,
  },
};

export function blockHash(blocks) {
  const input = JSON.stringify(blocks || []);
  let h = 5381;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 33) ^ input.charCodeAt(i);
  }
  return `m${(h >>> 0).toString(16).padStart(8, '0')}`;
}

export function uid(prefix = 'b') {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

export const BLOCK_LIBRARY = [
  { type: 'hero', label: 'Hero', hint: 'Headline, promise, primary action' },
  { type: 'stats', label: 'Proof strip', hint: 'Verified numbers or credentials' },
  { type: 'features', label: 'Capability grid', hint: 'Three or four service pillars' },
  { type: 'showcase', label: 'Showcase', hint: 'Image with supporting detail' },
  { type: 'gallery', label: 'Gallery', hint: 'Project or product imagery' },
  { type: 'pricing', label: 'Packages', hint: 'Tiers with inclusions' },
  { type: 'faq', label: 'FAQ', hint: 'Objection handling' },
  { type: 'cta', label: 'Closing CTA', hint: 'Convert at the end of the page' },
  { type: 'contact', label: 'Contact', hint: 'Enquiry capture and details' },
  { type: 'text', label: 'Editorial', hint: 'Long-form copy block' },
  { type: 'footer', label: 'Footer', hint: 'Identity and legal line' },
];