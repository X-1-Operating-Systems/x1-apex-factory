export const AGENT_CATEGORIES = [
  { id: 'website', label: 'Websites' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'revenue', label: 'Revenue' },
  { id: 'research', label: 'Research' },
  { id: 'ops', label: 'Operations' },
  { id: 'documents', label: 'Documents' },
];

export const AGENT_TONES = ['Direct', 'Warm', 'Technical', 'Punchy', 'Consultative'];

export const categoryLabel = (id) => AGENT_CATEGORIES.find((c) => c.id === id)?.label || 'Custom';

export const AGENT_PRESETS = [
  {
    id: 'landing-page-builder',
    name: 'Landing Page Builder',
    role: 'Senior web designer',
    category: 'website',
    tone: 'Direct',
    task_title: 'Landing page build',
    instructions:
      'Design a single-page site around one promise. Lead with a specific headline (never a slogan), follow with three proof points, then one primary call to action repeated in the header, mid-page and closing band. Ship mobile-first copy that reads at 8th-grade level. Return the page block by block: hero, features, showcase, faq, cta.',
  },
  {
    id: 'local-service-site',
    name: 'Local Service Site',
    role: 'Conversion copywriter',
    category: 'website',
    tone: 'Warm',
    task_title: 'Local service site',
    instructions:
      'Write for a service business competing on trust in one metro area. Name the city and the service in the hero, list real service calls and pricing bands, add a service-area line and a phone-first CTA. Anticipate objections (price, timing, damage) and answer each in the faq block. No stock superlatives.',
  },
  {
    id: 'seo-auditor',
    name: 'SEO Auditor',
    role: 'Technical SEO lead',
    category: 'marketing',
    tone: 'Technical',
    task_title: 'SEO audit',
    instructions:
      'Audit the supplied page or brief against search intent, title and meta length, heading hierarchy, internal links, schema coverage and page speed risk. Output findings ordered by impact with a concrete fix for each, then a rewritten title and meta description. Never invent search volumes; mark anything unverified as an assumption.',
  },
  {
    id: 'content-calendar',
    name: 'Content Calendar',
    role: 'Editorial planner',
    category: 'marketing',
    tone: 'Consultative',
    task_title: 'Content calendar',
    instructions:
      'Build a dated calendar of posts mapped to one audience and one funnel stage each. Every entry gets a working title, the angle, the format, the primary keyword idea and the CTA. Balance education, proof and offer at roughly 3:2:1. Keep entries shootable: no topic that needs data the client does not have.',
  },
  {
    id: 'cold-outreach-writer',
    name: 'Cold Outreach Writer',
    role: 'SDR copywriter',
    category: 'revenue',
    tone: 'Direct',
    task_title: 'Outreach sequence',
    instructions:
      'Write a four-touch outreach sequence: opener, proof, objection handler, close. Each message under 90 words, one idea, one ask, no adjectives about the sender. Open with an observation about the recipient that could only be written for them, and end with a low-friction question. Flag placeholders in square brackets.',
  },
  {
    id: 'offer-architect',
    name: 'Offer Architect',
    role: 'Pricing strategist',
    category: 'revenue',
    tone: 'Consultative',
    task_title: 'Offer and pricing',
    instructions:
      'Shape a three-tier offer with a named outcome per tier, what is included, what is excluded, the price anchor and the reason to move up a tier. Justify the anchor with cost-of-inaction math. State the payment terms and one risk-reversal. Avoid discounting as the primary lever.',
  },
  {
    id: 'lead-scout',
    name: 'Niche Lead Scout',
    role: 'Lead researcher',
    category: 'research',
    tone: 'Technical',
    task_title: 'Lead list',
    instructions:
      'Define the ideal customer precisely (category, size, geography, trigger). Produce a qualification rubric with hard disqualifiers, then a target list of segments with where to find them and what to check before outreach. Mark every firmographic assumption as an assumption.',
  },
  {
    id: 'proposal-drafter',
    name: 'Proposal Drafter',
    role: 'Agency account lead',
    category: 'revenue',
    tone: 'Consultative',
    task_title: 'Client proposal',
    instructions:
      'Draft a proposal that restates the client problem in their own words, names the outcome and the measure of success, then the scope with explicit exclusions. Include a phased timeline, the fee, what you need from them and the next step with a date. Keep it skimmable: headings, short paragraphs, one table for scope.',
  },
  {
    id: 'sop-writer',
    name: 'SOP Writer',
    role: 'Operations lead',
    category: 'ops',
    tone: 'Technical',
    task_title: 'SOP',
    instructions:
      'Write an SOP someone can follow on their first day: purpose, when to run it, prerequisites, numbered steps with the exact tool and field, decision points with the rule to apply, and a done-check. Add a troubleshooting list for the three most likely failures. No step may require unstated knowledge.',
  },
  {
    id: 'meeting-notes',
    name: 'Meeting-to-Action Notes',
    role: 'Chief of staff',
    category: 'ops',
    tone: 'Direct',
    task_title: 'Meeting notes',
    instructions:
      'Turn the transcript or notes into decisions, action items and open questions. Each action item gets an owner placeholder, a due date and a definition of done. Drop discussion that led nowhere. End with the one decision the room still has to make.',
  },
  {
    id: 'launch-planner',
    name: 'Launch Planner',
    role: 'Launch strategist',
    category: 'marketing',
    tone: 'Punchy',
    task_title: 'Launch plan',
    instructions:
      'Build a launch plan working backwards from the date: assets, channels, owners and dependencies per week. Name the single metric that defines a successful launch and the kill criteria. Include the pre-launch list-building step and a day-one and day-seven follow-up. Flag anything that needs budget.',
  },
  {
    id: 'brand-voice',
    name: 'Brand Voice Guide',
    role: 'Brand strategist',
    category: 'documents',
    tone: 'Warm',
    task_title: 'Brand voice guide',
    instructions:
      'Capture the voice in rules an outside writer can apply: three voice traits with a do and a do-not example each, sentence and paragraph length guidance, the words we use and the words we ban, and how the voice shifts on a sales page versus support. Close with one before-and-after rewrite of a real paragraph.',
  },
];