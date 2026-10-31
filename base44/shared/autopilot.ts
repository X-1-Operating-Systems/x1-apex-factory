import { auditPage } from './qa.ts';

// One command in, a built and validated site out. Every stage is one unit of work so a
// scheduled tick or an open page can carry the job forward without holding a request open.
export const MODEL = 'gpt_6_sol';
export const MAX_PAGES = 3;
export const MAX_REVISIONS = 2;
export const MAX_STEPS = 40;

const BLOCK_CONTRACT = `
- hero: {"eyebrow","title","subtitle","primaryCta","secondaryCta","image","imageAlt"}
- stats: {"items":[{"value","label"}]}                     2-4 verified proof points
- features: {"eyebrow","title","items":[{"title","body"}]} 3-4 capability pillars
- showcase: {"title","body","bullets":["..."],"image","imageAlt"}
- gallery: {"title","body","images":["url"],"captions":["..."]}
- pricing: {"title","body","plans":[{"name","price","period","features":["..."],"cta"}]}
- faq: {"title","items":[{"q","a"}]}                        4-6 real buyer questions
- cta: {"title","body","cta","note"}
- contact: {"title","body","phone","email","cta","placeholder"}
- text: {"title","body"}
- footer: {"brand","links":["..."],"note"}
`;

const ALLOWED_TYPES = [
  'hero', 'stats', 'features', 'showcase', 'gallery', 'pricing', 'faq', 'cta', 'contact', 'text', 'footer',
];

const STOCK = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
];

const PLAN_SCHEMA = {
  type: 'object',
  properties: {
    project_name: { type: 'string' },
    client_name: { type: 'string' },
    description: { type: 'string' },
    accent: { type: 'string' },
    surface: { type: 'string' },
    headline_font: { type: 'string' },
    pages: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          path: { type: 'string' },
          brief: { type: 'string' },
          seo_title: { type: 'string' },
          seo_description: { type: 'string' },
        },
        required: ['name', 'path', 'brief'],
      },
    },
  },
  required: ['project_name', 'pages'],
};

const PAGE_SCHEMA = {
  type: 'object',
  properties: {
    page_json: { type: 'string' },
    summary: { type: 'string' },
  },
  required: ['page_json', 'summary'],
};

function parseJson(raw: any) {
  const cleaned = String(raw || '')
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/, '')
    .trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

function cleanBlocks(parsed: any) {
  const seen = new Set();
  return (parsed?.blocks || [])
    .filter((b: any) => b && ALLOWED_TYPES.includes(b.type) && b.props && Object.keys(b.props).length > 0)
    .slice(0, 20)
    .map((b: any, i: number) => {
      let blockId = typeof b.id === 'string' && b.id.trim() ? b.id.trim().slice(0, 60) : `${b.type}_${i}`;
      if (seen.has(blockId)) blockId = `${blockId}_${i}`;
      seen.add(blockId);
      return { id: blockId, type: b.type, props: b.props };
    });
}

async function ask(base44: any, prompt: string, schema: any) {
  const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    model: MODEL,
    response_json_schema: schema,
  });
  return typeof result === 'string' ? parseJson(result) : result;
}

function step(job: any, key: string, label: string, state: string, detail = '') {
  const steps = [...(job.steps || []), { key, label, state, detail: String(detail).slice(0, 400), at: new Date().toISOString() }];
  job.steps = steps.slice(-MAX_STEPS);
}

function pageRecord(job: any, index: number) {
  return (job.pages || [])[index] || null;
}

async function briefStage(base44: any, job: any) {
  const plan = await ask(
    base44,
    `You are the lead on an autonomous web studio. Turn one operator command into a build plan that a build agent can execute with no further input.

OPERATOR COMMAND
${String(job.command).slice(0, 3000)}

RULES
- project_name: the client or product name, 2-5 words, taken from the command. Never invent a different brand.
- client_name: the organisation named in the command, or an empty string.
- description: one sentence on what this site is for.
- accent: a 6 digit hex that suits the brief. surface: "light" unless the brand is genuinely dark. headline_font: serif, display or sans.
- pages: home first with path "/", plus at most ${MAX_PAGES - 1} more page only if the command clearly needs them (about, services, work, pricing). Each page gets a brief of one or two sentences naming the sections it must carry.
- seo_title 30-60 characters, seo_description 90-155 characters. Only promise what the command supports.
- Never invent certifications, prices, awards, staff counts or client names.`,
    PLAN_SCHEMA,
  );
  if (!plan?.project_name || !Array.isArray(plan.pages) || plan.pages.length === 0) {
    throw new Error('The planner returned no usable plan.');
  }

  const project = await base44.asServiceRole.entities.Project.create({
    created_by_id: job.created_by_id,
    name: String(plan.project_name).slice(0, 120),
    client_name: String(plan.client_name || '').slice(0, 120),
    description: String(plan.description || job.command).slice(0, 900),
    master_instruction: String(job.command).slice(0, 3000),
    status: 'editing',
    accent: /^#[0-9a-fA-F]{6}$/.test(plan.accent) ? plan.accent : '#171717',
    surface: plan.surface === 'dark' ? 'dark' : 'light',
    headline_font: ['serif', 'display', 'sans'].includes(plan.headline_font) ? plan.headline_font : 'serif',
    deploy_target: 'vercel',
  });

  const pages = plan.pages.slice(0, MAX_PAGES);
  const created = [];
  for (let i = 0; i < pages.length; i += 1) {
    const entry = pages[i];
    const record = await base44.asServiceRole.entities.StudioPage.create({
      created_by_id: job.created_by_id,
      project_id: project.id,
      name: String(entry.name || `Page ${i + 1}`).slice(0, 80),
      path: i === 0 ? '/' : String(entry.path || `/${String(entry.name || i).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`).slice(0, 80),
      version: 1,
      blocks: [],
      seo_title: String(entry.seo_title || '').slice(0, 120),
      seo_description: String(entry.seo_description || '').slice(0, 400),
      notes: String(entry.brief || '').slice(0, 900),
    });
    created.push({ page_id: record.id, name: record.name, path: record.path, seo_title: record.seo_title, brief: entry.brief });
  }

  return {
    project_id: project.id,
    project_name: project.name,
    client_name: project.client_name,
    pages: created,
    stage: 'build',
    build_index: 0,
  };
}

async function buildStage(base44: any, job: any) {
  const entry = pageRecord(job, job.build_index || 0);
  if (!entry) return { stage: 'ceiling' };

  const project = await base44.asServiceRole.entities.Project.get(job.project_id);
  const page = await base44.asServiceRole.entities.StudioPage.get(entry.page_id);
  const fix = job.revision > 0 && job.fix_note ? `\nVALIDATION FINDINGS TO FIX (revision ${job.revision})\n${job.fix_note}\n` : '';

  const envelope = await ask(
    base44,
    `You are the build agent in a professional web production system. Write one complete website page as structured blocks. You never answer with advice — you produce the page.

PROJECT
Name: ${project.name}
Client: ${project.client_name || 'Unspecified'}
What it is for: ${String(project.description || '').slice(0, 600)}
Page: ${page.name} (${page.path})
Page brief: ${String(entry.brief || page.notes || '').slice(0, 800)}

TOKENS
accent: ${project.accent}
surface: ${project.surface}
headlineFont: ${project.headline_font}

CURRENT BLOCKS
${JSON.stringify(page.blocks || []).slice(0, 30000)}
${fix}
HOW TO WRITE
- Return the complete page as ordered blocks: hero, then 3-5 substantive sections, then a contact or closing CTA, then footer. 5 to 8 blocks.
- Senior editorial copy: concrete and plain. No lorem ipsum, no "your company", no "insert here", no em dashes, no absolute performance claims.
- Only state facts implied by the project or the command. Never invent certifications, prices, awards, staff counts, guarantees or client names.
- Images: only the approved URLs below. Always include descriptive imageAlt. Gallery blocks need captions.
- SEO title 30-60 characters, description 90-155 characters.

BLOCK SHAPES
${BLOCK_CONTRACT}
APPROVED IMAGE URLS
${STOCK.map((u) => `  ${u}`).join('\n')}

OUTPUT
"page_json" is one JSON object, no code fences: {"tokens":{"accent":"#1f4d3f","surface":"light","headlineFont":"serif"},"seo":{"title":"...","description":"..."},"blocks":[{"id":"hero","type":"hero","props":{...}}]}
"summary" is a short structural note such as "7 sections, hero plus contact route".`,
    PAGE_SCHEMA,
  );

  const parsed = parseJson(envelope?.page_json);
  const blocks = cleanBlocks(parsed);
  if (blocks.length === 0) throw new Error(`The builder returned no usable sections for ${page.name}.`);

  await base44.asServiceRole.entities.StudioPage.update(page.id, {
    version: Number(page.version || 1) + 1,
    blocks,
    seo_title: String(parsed?.seo?.title || page.seo_title || project.name).slice(0, 120),
    seo_description: String(parsed?.seo?.description || page.seo_description || '').slice(0, 400),
    notes: String(page.notes || '').slice(0, 900),
  });

  const nextIndex = (job.build_index || 0) + 1;
  step(job, `build_${page.id}`, `Built ${page.name}`, 'done', envelope?.summary || `${blocks.length} sections`);
  return {
    stage: nextIndex >= (job.pages || []).length ? 'ceiling' : 'build',
    build_index: nextIndex,
  };
}

async function ceilingStage(base44: any, job: any) {
  const rank: any = { pass: 0, review: 1, block: 2 };
  let worst = { verdict: 'pass', score: 100, checks: [] as any[], findings: [] as string[] };

  for (const entry of job.pages || []) {
    const page = await base44.asServiceRole.entities.StudioPage.get(entry.page_id);
    const audit: any = auditPage(page);
    if (rank[audit.verdict] > rank[worst.verdict] || (audit.verdict === worst.verdict && audit.score < worst.score)) {
      worst = audit;
    }
  }

  step(job, 'ceiling', `Ceiling validation ${worst.score}/100 ${worst.verdict}`, worst.verdict === 'block' ? 'failed' : 'done', (worst.findings || []).slice(0, 4).join(' · '));

  if (worst.verdict === 'block' && (job.revision || 0) < MAX_REVISIONS) {
    return {
      stage: 'build',
      build_index: 0,
      revision: (job.revision || 0) + 1,
      fix_note: (worst.findings || []).join('\n'),
      ceiling: worst,
    };
  }
  if (worst.verdict === 'block') {
    return { status: 'failed', stage: 'done', ceiling: worst, error: 'The ceiling gate still blocks after every revision: ' + (worst.findings || []).slice(0, 3).join(' · ') };
  }
  return { stage: 'ship', ceiling: worst };
}

async function shipStage(_base44: any, job: any) {
  // Safety gate: an automated ceiling score NEVER approves production publication.
  // Do not even call deployRelease(action: 'run') here: its provider behavior may
  // create a deployment. The owner must separately authorize the exact target,
  // source revision, costs, and independent Guardian receipt in a release workflow.
  const note = 'Awaiting explicit owner authorization and independent Guardian release receipt. No deployment was initiated.';
  step(job, 'ship', 'Release requires owner approval', 'skipped', note);
  return {
    stage: 'done',
    status: 'awaiting_approval',
    browser_note: note,
    error: '',
  };
}

async function verifyStage(base44: any, job: any) {
  if (!job.browser_run_id) {
    // Browser runs live in the browser service, not the host client, so the run is started there.
    const created = await base44.asServiceRole.functions.invoke('browserbase', {
      action: 'runs.create',
      params: {
        task: `Open ${job.live_url} and report the main headline, whether the page loaded a hero section, and whether a contact route is present.`,
        max_steps: 8,
      },
    });
    const runId = created?.data?.data?.run_id || '';
    if (!runId) {
      const message = created?.data?.error || 'The browser service did not accept the run.';
      step(job, 'verify', 'Cloud browser unavailable', 'skipped', message);
      return { stage: 'done', status: 'done', browser_note: message };
    }
    return { browser_run_id: runId, browser_note: 'Running a real browser against the live site.' };
  }

  const read = await base44.asServiceRole.functions.invoke('browserbase', {
    action: 'runs.get',
    params: { run_id: job.browser_run_id },
  });
  const result = read?.data || {};
  const data = result?.data || {};
  const status = String(data.status || '').toUpperCase();
  if (!result?.ok) {
    return { stage: 'done', status: 'done', browser_note: result?.error || 'The browser run could not be read.' };
  }
  if (status !== 'COMPLETED' && status !== 'SUCCEEDED' && status !== 'FAILED' && status !== 'ERROR') {
    return { browser_note: `Browser run ${status || 'in progress'}.` };
  }

  const output = JSON.stringify(data.output || data.result || '');
  const firstPage = await base44.asServiceRole.entities.StudioPage.get(pageRecord(job, 0)?.page_id).catch(() => null);
  const heroTitle = String((firstPage?.blocks || []).find((b: any) => b.type === 'hero')?.props?.title || '');
  const head = heroTitle.split(/\s+/).filter((w) => w.length > 4)[0] || '';
  const matched = head ? output.toLowerCase().includes(head.toLowerCase()) : output.length > 20;

  step(
    job,
    'verify',
    matched ? 'Verified in the cloud browser' : 'Browser check found a mismatch',
    matched ? 'done' : 'failed',
    String(output).slice(0, 300),
  );
  return {
    stage: 'done',
    status: matched ? 'done' : 'failed',
    browser_note: matched
      ? `The live page answered in a real browser${head ? ` and carried "${head}"` : ''}.`
      : 'The live page did not carry the headline the build wrote.',
    error: matched ? '' : 'The deployed page did not match the built page.',
  };
}

/** Advance one job by exactly one stage. Called by the clock workflow and by the page poll. */
export async function advanceJob(base44: any, record: any) {
  const job = { ...record };
  if (['done', 'failed', 'stopped'].includes(job.status)) return job;

  let patch: any = { status: 'running' };
  try {
    if (job.stage === 'brief') patch = { ...patch, ...(await briefStage(base44, job)) };
    else if (job.stage === 'build') patch = { ...patch, ...(await buildStage(base44, job)) };
    else if (job.stage === 'ceiling') patch = { ...patch, ...(await ceilingStage(base44, job)) };
    else if (job.stage === 'ship') patch = { ...patch, ...(await shipStage(base44, job)) };
    else if (job.stage === 'verify') patch = { ...patch, ...(await verifyStage(base44, job)) };
    else patch = { ...patch, stage: 'done', status: 'done' };
  } catch (error: any) {
    const message = String(error?.message || 'The run stopped on an error.');
    step(job, `error_${job.stage}`, `Stopped in ${job.stage}`, 'failed', message);
    patch = { ...patch, status: 'failed', stage: 'done', error: message.slice(0, 900) };
  }

  patch.steps = job.steps || [];
  patch.next_at = new Date(Date.now() + 6000).toISOString();
  return await base44.asServiceRole.entities.AutopilotJob.update(job.id, patch);
}