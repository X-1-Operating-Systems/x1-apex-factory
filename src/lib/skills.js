export const SKILL_CATEGORIES = [
  { id: 'craft', label: 'Craft' },
  { id: 'voice', label: 'Voice' },
  { id: 'research', label: 'Research' },
  { id: 'technical', label: 'Technical' },
  { id: 'ops', label: 'Operations' },
];

export const skillCategoryLabel = (id) => SKILL_CATEGORIES.find((c) => c.id === id)?.label || 'Craft';

export const CORE_SKILLS = [
  {
    id: 'mobile-first',
    name: 'Mobile-first layouts',
    category: 'craft',
    description: 'Assume a phone first, then widen.',
    instructions:
      'Design every page for a 390px phone first. Stack sections, one idea per screen, tap targets at least 44px, no horizontal scroll. Then describe how it widens at tablet and desktop.',
  },
  {
    id: 'proof-standard',
    name: 'Proof standard',
    category: 'research',
    description: 'Every claim carries evidence or is flagged.',
    instructions:
      'Every quantitative or comparative claim needs a number, a named example or a date. If the input does not supply one, flag it inline as [verify] rather than inventing it.',
  },
  {
    id: 'house-voice',
    name: 'House voice',
    category: 'voice',
    description: 'Plain, specific, no filler.',
    instructions:
      'Write in short declarative sentences. Prefer a concrete noun to an adjective. Ban the words leverage, seamless, cutting-edge, unlock, game-changer and robust. Never open with "In today\'s".',
  },
  {
    id: 'seo-baseline',
    name: 'SEO baseline',
    category: 'technical',
    description: 'Titles, descriptions and headings done right.',
    instructions:
      'For any page deliverable include a 55-60 character title, a 140-155 character meta description, one H1, sequential H2s, and descriptive alt text for every image. Name the primary keyword once in the H1 and once in the first paragraph.',
  },
  {
    id: 'accessibility-baseline',
    name: 'Accessibility baseline',
    category: 'technical',
    description: 'Readable, navigable, contrast-safe.',
    instructions:
      'Hold body text at 16px or larger with a 1.5 line height, keep contrast at 4.5:1 or better, label every form field, and give every interactive element a visible focus state and a plain-language label.',
  },
  {
    id: 'single-cta',
    name: 'One primary action',
    category: 'craft',
    description: 'One ask per page, repeated.',
    instructions:
      'Each page gets exactly one primary call to action with one verb and one outcome. Repeat it in the hero, mid-page and closing band with identical wording; everything else is a secondary link.',
  },
  {
    id: 'pricing-reality',
    name: 'Pricing realism',
    category: 'ops',
    description: 'Bands and terms, not vague numbers.',
    instructions:
      'When pricing appears, give bands with what changes between them, what is excluded, and the payment terms. Never invent a competitor price; if a figure is not supplied, present the structure and mark the numbers [client to confirm].',
  },
  {
    id: 'handoff-ready',
    name: 'Handoff ready',
    category: 'ops',
    description: 'End with the next action.',
    instructions:
      'Close every deliverable with a short handoff: what is finished, what is still open, and the single next action with an owner placeholder. No deliverable ships without it.',
  },
];