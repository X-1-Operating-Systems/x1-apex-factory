import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const ALLOWED_TYPES = [
  'hero',
  'stats',
  'features',
  'showcase',
  'gallery',
  'pricing',
  'faq',
  'cta',
  'contact',
  'text',
  'footer',
];

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

const STOCK = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
];

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    reply: { type: 'string' },
    summary: { type: 'string' },
    page_json: { type: 'string' },
  },
  required: ['reply', 'summary', 'page_json'],
};

function parsePage(raw) {
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

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { project, page, instruction, attachment_urls, history } = body;

    if (!instruction || typeof instruction !== 'string' || !instruction.trim()) {
      return Response.json({ error: 'An instruction is required.' }, { status: 400 });
    }
    if (!page || !Array.isArray(page.blocks)) {
      return Response.json({ error: 'A page with blocks is required.' }, { status: 400 });
    }

    const currentBlocks = JSON.stringify(page.blocks).slice(0, 40000);
    const conversation = Array.isArray(history)
      ? history
          .slice(-6)
          .map((m) => `${m.role === 'user' ? 'Operator' : 'Studio'}: ${String(m.content || '').slice(0, 600)}`)
          .join('\n')
      : '';
    const images = Array.isArray(attachment_urls) ? attachment_urls.slice(0, 4) : [];

    const prompt = `You are the build agent inside X1 Studio, a professional web production system. You edit a client website page by rewriting its sections. You never answer with advice — you make the change and return the page.

CLIENT
Project: ${String(project?.name || 'Untitled').slice(0, 120)}
Client: ${String(project?.client_name || 'Unspecified').slice(0, 120)}
Page: ${String(page.name || 'Home').slice(0, 60)} (${String(page.path || '/').slice(0, 60)})

CURRENT TOKENS
accent: ${String(project?.accent || '#b4532a')}
surface: ${String(project?.surface || 'light')}
headlineFont: ${String(project?.headline_font || 'serif')}

CURRENT BLOCKS (JSON)
${currentBlocks}

OPERATOR INSTRUCTION
${instruction.slice(0, 3000)}

${conversation ? `RECENT CONVERSATION\n${conversation}\n` : ''}${images.length ? `ATTACHED IMAGES (use these as this build's real imagery):\n${images.join('\n')}\n` : ''}
HOW TO WRITE
- Return the complete page as an ordered list of blocks: keep what already works, rewrite what the instruction targets, add or remove sections only where it improves the page.
- A finished page runs: hero, then 3-5 substantive sections, then a contact or closing CTA, then footer. Aim for 5 to 8 blocks.
- Write like a senior editorial copywriter: concrete and plain. No lorem ipsum, no "your company", no "insert here", no buzzword filler, no em dashes.
- Only state facts implied by the project, the client name or the instruction. Never invent certifications, prices, awards, staff counts, guarantees or client names. Where a fact is unknown, write around it honestly.
- Images: only the approved URLs below or an attached URL above. Never invent an image URL. Always include a descriptive imageAlt; gallery blocks need captions.
- The SEO title is 30-60 characters and specific; the description is 90-155 characters and promises something true.
- Tokens: accent is a 6 digit hex, surface light unless the brand is genuinely dark, headlineFont is serif for craft or premium, display for editorial or creative, sans for technical or modern.

BLOCK SHAPES (props per type)
${BLOCK_CONTRACT}
APPROVED IMAGE URLS
${STOCK.map((u) => `  ${u}`).join('\n')}

OUTPUT
"page_json" must be a single JSON object, no code fences, no commentary, exactly this shape:
{"tokens":{"accent":"#1f4d3f","surface":"light","headlineFont":"serif"},"seo":{"title":"...","description":"..."},"blocks":[{"id":"hero","type":"hero","props":{...}}]}
Every block needs a stable, unique id and a fully populated props object for its type. "reply" is 1-3 sentences describing what you changed. "summary" is a short structural note such as "v12 - 7 sections - hero rewritten".`;

    const llmResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      file_urls: images,
      response_json_schema: RESPONSE_SCHEMA,
    });

    const envelope = typeof llmResult === 'string' ? JSON.parse(llmResult) : llmResult;
    const parsedPage = parsePage(envelope?.page_json);
    if (!parsedPage || !Array.isArray(parsedPage.blocks) || parsedPage.blocks.length === 0) {
      return Response.json({ error: 'The agent could not compose that. Try a more specific instruction.' }, { status: 422 });
    }

    const seen = new Set();
    const blocks = parsedPage.blocks
      .filter((b) => b && ALLOWED_TYPES.includes(b.type) && b.props && Object.keys(b.props).length > 0)
      .slice(0, 20)
      .map((b, i) => {
        let blockId = typeof b.id === 'string' && b.id.trim() ? b.id.trim().slice(0, 60) : `${b.type}_${i}`;
        if (seen.has(blockId)) blockId = `${blockId}_${i}`;
        seen.add(blockId);
        return { id: blockId, type: b.type, props: b.props };
      });

    if (blocks.length === 0) {
      return Response.json({ error: 'The agent returned no usable sections. Try rephrasing.' }, { status: 422 });
    }

    const tokens = parsedPage.tokens || {};
    const accent = typeof tokens.accent === 'string' && /^#[0-9a-fA-F]{6}$/.test(tokens.accent)
      ? tokens.accent
      : project?.accent || '#b4532a';
    const surface = tokens.surface === 'dark' ? 'dark' : 'light';
    const headlineFont = ['serif', 'display', 'sans'].includes(tokens.headlineFont)
      ? tokens.headlineFont
      : project?.headline_font || 'serif';

    return Response.json({
      reply: String(envelope?.reply || 'Canvas updated.').slice(0, 2000),
      summary: String(envelope?.summary || `${blocks.length} sections`).slice(0, 160),
      seo: {
        title: String(parsedPage.seo?.title || page.seo_title || project?.name || '').slice(0, 120),
        description: String(parsedPage.seo?.description || page.seo_description || '').slice(0, 400),
      },
      tokens: { accent, surface, headlineFont },
      blocks,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}