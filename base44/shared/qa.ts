const PLACEHOLDERS = [
  'lorem ipsum',
  'insert ',
  'your company',
  'company name',
  'todo',
  'xxx',
  'placeholder',
  'coming soon',
  '[',
];

const ABSOLUTE_CLAIMS = ['guaranteed', 'best in the world', '#1 ', 'number one', '100% results', 'instant results'];

function collectText(blocks: any[]) {
  const parts: string[] = [];
  const walk = (value: any) => {
    if (typeof value === 'string') parts.push(value);
    else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === 'object') Object.values(value).forEach(walk);
  };
  walk(blocks);
  return parts.join(' ');
}

function collectImages(blocks: any[]) {
  const found: { url: string; alt: string }[] = [];
  const push = (url: any, alt: any) => {
    if (typeof url === 'string' && url.startsWith('http')) {
      found.push({ url, alt: typeof alt === 'string' ? alt.trim() : '' });
    }
  };
  for (const block of blocks || []) {
    const p = block.props || {};
    push(p.image, p.imageAlt);
    (p.images || []).forEach((url: string, i: number) => push(url, (p.captions || [])[i]));
  }
  return found;
}

// Deterministic release review. Shared by the manual review and the release pipeline.
export function auditPage(page: any) {
  const blocks = page.blocks || [];
  const text = collectText(blocks);
  const words = text.split(/\s+/).filter(Boolean).length;
  const types = blocks.map((b: any) => b.type);
  const hero = blocks.find((b: any) => b.type === 'hero');
  const images = collectImages(blocks);
  const missingAlt = images.filter((img) => !img.alt);
  const lowerText = text.toLowerCase();
  const foundPlaceholders = PLACEHOLDERS.filter((token) => lowerText.includes(token));
  const foundClaims = ABSOLUTE_CLAIMS.filter((token) => lowerText.includes(token));
  const hasContact = types.includes('contact') || /\S+@\S+\.\S+/.test(text);
  const duplicateIds = blocks.length !== new Set(blocks.map((b: any) => b.id)).size;
  const titleLength = String(page.seo_title || '').trim().length;
  const descriptionLength = String(page.seo_description || '').trim().length;
  const hasFooter = types.includes('footer');
  const ctaCount = blocks.filter((b: any) => ['cta', 'contact', 'pricing'].includes(b.type)).length;

  const checks = [
    {
      id: 'V1',
      role: 'Validator',
      label: 'Structure',
      status: blocks.length >= 4 && Boolean(hero) ? 'pass' : 'fail',
      detail: `${blocks.length} sections${hero ? ', hero present' : ', no hero'}`,
    },
    {
      id: 'V2',
      role: 'Validator',
      label: 'Block integrity',
      status: duplicateIds ? 'fail' : 'pass',
      detail: duplicateIds ? 'Duplicate block identifiers found' : 'Every block has a unique identifier',
    },
    {
      id: 'V3',
      role: 'Validator',
      label: 'Title tag',
      status: titleLength >= 20 && titleLength <= 65 ? 'pass' : titleLength === 0 ? 'fail' : 'warn',
      detail: `${titleLength} characters (target 20-65)`,
    },
    {
      id: 'V4',
      role: 'Validator',
      label: 'Meta description',
      status: descriptionLength >= 80 && descriptionLength <= 160 ? 'pass' : descriptionLength === 0 ? 'fail' : 'warn',
      detail: `${descriptionLength} characters (target 80-160)`,
    },
    {
      id: 'Q1',
      role: 'QA',
      label: 'Image alt text',
      status: images.length === 0 ? 'warn' : missingAlt.length === 0 ? 'pass' : 'fail',
      detail: images.length === 0 ? 'No imagery on the page yet' : `${images.length} images, ${missingAlt.length} without alt text`,
    },
    {
      id: 'Q2',
      role: 'QA',
      label: 'Primary action',
      status: hero?.props?.primaryCta ? 'pass' : 'warn',
      detail: hero?.props?.primaryCta ? `Hero action: ${String(hero.props.primaryCta).slice(0, 40)}` : 'Hero has no primary action',
    },
    {
      id: 'Q3',
      role: 'QA',
      label: 'Conversion path',
      status: hasContact ? 'pass' : 'fail',
      detail: hasContact ? `${ctaCount} conversion sections, contact route present` : 'No contact route or contact details',
    },
    {
      id: 'Q4',
      role: 'QA',
      label: 'Copy depth',
      status: words >= 220 ? 'pass' : words >= 120 ? 'warn' : 'fail',
      detail: `${words} words on the page`,
    },
    {
      id: 'Q5',
      role: 'QA',
      label: 'Placeholder sweep',
      status: foundPlaceholders.length === 0 ? 'pass' : 'fail',
      detail: foundPlaceholders.length === 0 ? 'No placeholder text found' : `Placeholder text: ${foundPlaceholders.slice(0, 3).join(', ')}`,
    },
    {
      id: 'G1',
      role: 'Guardian',
      label: 'Claim discipline',
      status: foundClaims.length === 0 ? 'pass' : 'warn',
      detail: foundClaims.length === 0 ? 'No absolute performance claims' : `Unverifiable claims: ${foundClaims.slice(0, 3).join(', ')}`,
    },
    {
      id: 'G2',
      role: 'Guardian',
      label: 'Page completeness',
      status: hasFooter ? 'pass' : 'warn',
      detail: hasFooter ? 'Footer identity and legal line present' : 'No footer block',
    },
    {
      id: 'G3',
      role: 'Guardian',
      label: 'Release readiness',
      status: blocks.length >= 4 && hasContact && !duplicateIds && foundPlaceholders.length === 0 ? 'pass' : 'fail',
      detail: 'Structure, conversion route and content hygiene must all hold before a manifest is prepared',
    },
  ];

  const weight: Record<string, number> = { pass: 1, warn: 0.5, fail: 0 };
  const rawScore = Math.round((checks.reduce((sum, c) => sum + weight[c.status], 0) / checks.length) * 100);
  const failed = checks.filter((c) => c.status === 'fail');
  const warned = checks.filter((c) => c.status === 'warn');
  const verdict = failed.length > 0 ? 'block' : warned.length > 0 ? 'review' : 'pass';
  const score = verdict === 'block' ? Math.min(rawScore, 68) : verdict === 'review' ? Math.min(rawScore, 84) : rawScore;

  const findings = [...failed, ...warned].slice(0, 6).map((c) => `${c.label}: ${c.detail}`);

  return { verdict, score, checks, findings };
}