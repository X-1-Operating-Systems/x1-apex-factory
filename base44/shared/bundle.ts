export async function manifestHash(blocks: any[]) {
  const bytes = new TextEncoder().encode(JSON.stringify(blocks || []));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 12);
}

const esc = (value: any) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const SURFACES: Record<string, Record<string, string>> = {
  light: { bg: '#fbf9f6', fg: '#161310', muted: '#6d655b', card: '#ffffff', line: 'rgba(22,19,16,0.10)', soft: '#f2ede6' },
  dark: { bg: '#0f0e0d', fg: '#f5f1ea', muted: '#a79e93', card: '#191715', line: 'rgba(255,255,255,0.11)', soft: '#141211' },
};

const FONTS: Record<string, string> = {
  serif: 'Georgia, "Fraunces", "Times New Roman", serif',
  display: '"Fraunces", Georgia, serif',
  sans: '"Inter", ui-sans-serif, system-ui, sans-serif',
};

const STYLE = `
:root{--bg:%BG%;--fg:%FG%;--muted:%MUTED%;--card:%CARD%;--line:%LINE%;--soft:%SOFT%;--accent:%ACCENT%;--display:%DISPLAY%}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font-family:"Inter",ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased;letter-spacing:-0.011em}
.wrap{max-width:1120px;margin:0 auto;padding:0 clamp(20px,6vw,64px);width:100%}
.sec{padding:clamp(32px,6vw,86px) 0}
.soft{background:var(--soft)}
.tight{padding-top:0}
h1{font-family:var(--display);font-weight:400;font-size:clamp(2rem,6vw,4.4rem);line-height:1;letter-spacing:-0.035em;margin:0}
h2{font-family:var(--display);font-weight:400;font-size:clamp(1.5rem,3.4vw,2.6rem);line-height:1.06;letter-spacing:-0.028em;margin:0}
h3{font-weight:600;font-size:clamp(1rem,1.6vw,1.2rem);line-height:1.3;letter-spacing:-0.01em;margin:0}
p{margin:0}
.eyebrow{font-size:0.72rem;letter-spacing:0.22em;text-transform:uppercase;font-weight:600;color:var(--accent);margin-bottom:14px}
.lead{font-size:clamp(0.98rem,1.5vw,1.16rem);line-height:1.6;color:var(--muted);margin-top:18px;max-width:52ch}
.body{font-size:clamp(0.86rem,1.2vw,0.97rem);line-height:1.65;color:var(--muted)}
.small{font-size:0.78rem;line-height:1.5;color:var(--muted)}
.btn{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:12px 24px;font-size:0.85rem;font-weight:600;text-decoration:none}
.btn-primary{background:var(--accent);color:#fff}
.btn-ghost{border:1px solid var(--line);color:var(--fg);margin-left:10px}
.actions{display:flex;flex-wrap:wrap;align-items:center;margin-top:28px}
.split{display:flex;flex-wrap:wrap;gap:clamp(20px,4vw,56px);align-items:center}
.split>*{flex:1 1 300px;min-width:0}
.grid{display:grid;gap:clamp(16px,2.4vw,32px);grid-template-columns:repeat(auto-fit,minmax(210px,1fr))}
.grid-wide{grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
.rule{border-top:1px solid var(--line);padding-top:clamp(16px,2.4vw,28px)}
.stack{display:grid;gap:12px;margin-top:18px}
img{max-width:100%;display:block;border-radius:6px;height:auto}
figure{margin:0;background:var(--card);border-radius:6px;overflow:hidden}
figcaption{padding:10px 12px}
ul{list-style:none;padding:0;margin:0;display:grid;gap:10px}
li.tick{display:flex;gap:10px;font-size:clamp(0.86rem,1.2vw,0.97rem);line-height:1.6}
li.tick span:first-child{color:var(--accent)}
.card{background:var(--card);border:1px solid var(--line);border-radius:6px;padding:clamp(16px,2.4vw,26px);display:flex;flex-direction:column}
.card.lead-plan{border-color:var(--accent)}
.panel{background:var(--accent);color:#fff;border-radius:8px;padding:clamp(24px,5vw,60px)}
.panel h2{color:#fff;max-width:30ch}
.panel .body{color:rgba(255,255,255,0.86);margin-top:12px;max-width:52ch}
form{display:grid;gap:10px;background:var(--soft);padding:clamp(16px,2.4vw,26px);border-radius:6px}
input,textarea{width:100%;background:var(--card);border:1px solid var(--line);border-radius:4px;padding:11px 13px;font:inherit;font-size:0.88rem;color:var(--fg)}
textarea{min-height:92px;resize:vertical}
button{border:0;background:var(--accent);color:#fff;border-radius:999px;padding:11px 18px;font:inherit;font-size:0.84rem;font-weight:600;cursor:pointer}
.review{border-top:1px solid var(--line);padding:clamp(11px,1.6vw,18px) 0}
footer{border-top:1px solid var(--line);padding:clamp(18px,3vw,30px) 0;background:var(--bg)}
.foot{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px}
.foot-links{display:flex;flex-wrap:wrap;gap:16px}
@media (max-width:640px){.btn-ghost{margin-left:0;margin-top:10px}}
`;

function renderBlock(block: any): string {
  const p = block.props || {};
  switch (block.type) {
    case 'hero': {
      const media = p.image
        ? `<div><img src="${esc(p.image)}" alt="${esc(p.imageAlt || p.title)}" loading="lazy"></div>`
        : '';
      const actions = `${p.primaryCta ? `<a class="btn btn-primary" href="#enquiry">${esc(p.primaryCta)}</a>` : ''}${
        p.secondaryCta ? `<a class="btn btn-ghost" href="#work">${esc(p.secondaryCta)}</a>` : ''
      }`;
      return `<section class="sec"><div class="wrap"><div class="split"><div>
${p.eyebrow ? `<p class="eyebrow">${esc(p.eyebrow)}</p>` : ''}
<h1>${esc(p.title)}</h1>
${p.subtitle ? `<p class="lead">${esc(p.subtitle)}</p>` : ''}
${actions ? `<div class="actions">${actions}</div>` : ''}
</div>${media}</div></div></section>`;
    }
    case 'stats': {
      const items = (p.items || [])
        .map((item: any) => `<div><p style="font-family:var(--display);font-size:clamp(1.3rem,2.6vw,2rem);letter-spacing:-0.03em">${esc(item.value)}</p><p class="small" style="margin-top:6px">${esc(item.label)}</p></div>`)
        .join('');
      return `<section class="sec tight"><div class="wrap"><div class="grid rule">${items}</div></div></section>`;
    }
    case 'features': {
      const items = (p.items || [])
        .map((item: any) => `<div class="rule"><h3>${esc(item.title)}</h3><p class="body" style="margin-top:8px">${esc(item.body)}</p></div>`)
        .join('');
      return `<section class="sec soft"><div class="wrap">
${p.eyebrow ? `<p class="eyebrow">${esc(p.eyebrow)}</p>` : ''}
<h2>${esc(p.title)}</h2><div class="grid" style="margin-top:clamp(20px,3.4vw,44px)">${items}</div></div></section>`;
    }
    case 'showcase': {
      const bullets = (p.bullets || []).map((b: any) => `<li class="tick"><span>&#10003;</span><span>${esc(b)}</span></li>`).join('');
      return `<section class="sec" id="work"><div class="wrap"><div class="split">
<div>${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.imageAlt || p.title)}" loading="lazy">` : ''}</div>
<div><h2>${esc(p.title)}</h2>${p.body ? `<p class="body" style="margin-top:14px">${esc(p.body)}</p>` : ''}${bullets ? `<ul class="stack">${bullets}</ul>` : ''}</div>
</div></div></section>`;
    }
    case 'text':
      return `<section class="sec"><div class="wrap" style="max-width:760px">
${p.title ? `<h2>${esc(p.title)}</h2>` : ''}<p class="body" style="margin-top:14px;white-space:pre-line">${esc(p.body)}</p></div></section>`;
    case 'gallery': {
      const figures = (p.images || [])
        .map((src: string, i: number) => {
          const caption = (p.captions || [])[i];
          return `<figure><img src="${esc(src)}" alt="${esc(caption || `${p.title || 'Project'} ${i + 1}`)}" loading="lazy">${
            caption ? `<figcaption class="small">${esc(caption)}</figcaption>` : ''
          }</figure>`;
        })
        .join('');
      return `<section class="sec soft"><div class="wrap"><h2>${esc(p.title)}</h2>${
        p.body ? `<p class="body" style="margin-top:10px;max-width:54ch">${esc(p.body)}</p>` : ''
      }<div class="grid" style="margin-top:clamp(18px,2.6vw,32px)">${figures}</div></div></section>`;
    }
    case 'pricing': {
      const plans = (p.plans || [])
        .map((plan: any, i: number) => `<div class="card${i === 0 ? ' lead-plan' : ''}">
<p class="eyebrow" style="color:var(--muted)">${esc(plan.name)}</p>
<p style="font-family:var(--display);font-size:clamp(1.3rem,2.4vw,1.9rem);margin-top:8px">${esc(plan.price)}${
          plan.period ? `<span class="small" style="margin-left:6px">${esc(plan.period)}</span>` : ''
        }</p>
<ul class="stack" style="flex:1">${(plan.features || []).map((f: any) => `<li class="body">${esc(f)}</li>`).join('')}</ul>
<a class="btn ${i === 0 ? 'btn-primary' : 'btn-ghost'}" style="margin-top:18px;margin-left:0" href="#enquiry">${esc(plan.cta || 'Enquire')}</a>
</div>`)
        .join('');
      return `<section class="sec"><div class="wrap"><h2>${esc(p.title)}</h2>${
        p.body ? `<p class="body" style="margin-top:10px;max-width:54ch">${esc(p.body)}</p>` : ''
      }<div class="grid grid-wide" style="margin-top:clamp(18px,3vw,36px)">${plans}</div></div></section>`;
    }
    case 'faq': {
      const items = (p.items || [])
        .map((item: any) => `<div class="review"><h3>${esc(item.q)}</h3><p class="body" style="margin-top:7px">${esc(item.a)}</p></div>`)
        .join('');
      return `<section class="sec soft"><div class="wrap"><h2>${esc(p.title)}</h2><div style="margin-top:clamp(14px,2.4vw,26px);max-width:72ch">${items}</div></div></section>`;
    }
    case 'cta':
      return `<section class="sec"><div class="wrap"><div class="panel">
<h2>${esc(p.title)}</h2>${p.body ? `<p class="body">${esc(p.body)}</p>` : ''}
<div class="actions"><a class="btn" style="background:#fff;color:var(--accent)" href="#enquiry">${esc(p.cta || 'Get in touch')}</a>${
        p.note ? `<span class="small" style="margin-left:14px;color:rgba(255,255,255,0.8)">${esc(p.note)}</span>` : ''
      }</div></div></div></section>`;
    case 'contact': {
      const lines = [p.phone, p.email]
        .filter(Boolean)
        .map((line: string) => `<p class="body" style="color:var(--fg)">${esc(line)}</p>`)
        .join('');
      return `<section class="sec" id="enquiry"><div class="wrap"><div class="split">
<div><h2>${esc(p.title)}</h2>${p.body ? `<p class="body" style="margin-top:12px;max-width:42ch">${esc(p.body)}</p>` : ''}${
        lines ? `<div class="stack">${lines}</div>` : ''
      }</div>
<div><form action="${p.email ? `mailto:${esc(p.email)}` : '#'}" method="post" enctype="text/plain">
<input name="name" placeholder="Name" aria-label="Name" required>
<input name="email" type="email" placeholder="Email" aria-label="Email" required>
<textarea name="message" placeholder="${esc(p.placeholder || 'What do you need?')}" aria-label="Message"></textarea>
<button type="submit">${esc(p.cta || 'Send enquiry')}</button>
</form></div></div></div></section>`;
    }
    case 'footer': {
      const links = (p.links || []).map((link: string) => `<span class="small">${esc(link)}</span>`).join('');
      return `<footer><div class="wrap"><div class="foot">
<p style="font-family:var(--display);font-size:0.92rem">${esc(p.brand)}</p>
<div class="foot-links">${links}</div></div>${p.note ? `<p class="small" style="margin-top:10px">${esc(p.note)}</p>` : ''}</div></footer>`;
    }
    default:
      return '';
  }
}

export function renderPageHtml({ project, page }: { project: any; page: any }) {
  const th = SURFACES[project?.surface === 'dark' ? 'dark' : 'light'];
  const accent = /^#[0-9a-fA-F]{3,8}$/.test(String(project?.accent || '')) ? project.accent : '#b4532a';
  const display = FONTS[project?.headline_font] || FONTS.serif;
  const css = STYLE.replace('%BG%', th.bg)
    .replace('%FG%', th.fg)
    .replace('%MUTED%', th.muted)
    .replace('%CARD%', th.card)
    .replace('%LINE%', th.line)
    .replace('%SOFT%', th.soft)
    .replace('%ACCENT%', accent)
    .replace('%DISPLAY%', display);

  const title = String(page?.seo_title || project?.name || 'Website');
  const description = String(page?.seo_description || project?.description || '');
  const body = (page?.blocks || []).map(renderBlock).join('\n');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&display=swap" rel="stylesheet">
<style>${css}</style>
</head>
<body>
${body}
</body>
</html>`;
}

const DOCKERFILE = [
  'FROM nginx:alpine',
  'COPY index.html /usr/share/nginx/html/index.html',
  'COPY nginx.conf /etc/nginx/conf.d/default.conf',
  'EXPOSE 80',
  'CMD ["nginx", "-g", "daemon off;"]',
].join('\n');

const NGINX = [
  'server {',
  '  listen 80;',
  '  root /usr/share/nginx/html;',
  '  index index.html;',
  '  location / { try_files $uri $uri/ /index.html; }',
  '}',
].join('\n');

const GITHUB_WORKFLOW = [
  'name: Deploy to GitHub Pages',
  'on:',
  '  push:',
  '    branches: [main]',
  'permissions:',
  '  contents: read',
  '  pages: write',
  '  id-token: write',
  'jobs:',
  '  deploy:',
  '    runs-on: ubuntu-latest',
  '    environment:',
  '      name: github-pages',
  '      url: ${{ steps.deployment.outputs.page_url }}',
  '    steps:',
  '      - uses: actions/checkout@v4',
  '      - uses: actions/configure-pages@v5',
  '      - uses: actions/upload-pages-artifact@v3',
  '        with:',
  '          path: .',
  '      - id: deployment',
  '        uses: actions/deploy-pages@v4',
].join('\n');

function pageFileName(path: string) {
  const clean = String(path || '/')
    .trim()
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');
  if (!clean) return 'index.html';
  if (/\.[a-z0-9]{2,5}$/i.test(clean)) return clean;
  return `${clean}/index.html`;
}

export function targetFiles(
  target: string,
  pages: { name: string; path: string; html: string }[],
  manifest: any
) {
  const used = new Set<string>();
  const files: { name: string; content: string; type: string }[] = [];
  for (const page of pages) {
    let name = pageFileName(page.path);
    if (used.has(name)) {
      const stamp = used.size + 1;
      name = name === 'index.html' ? `page-${stamp}.html` : name.replace(/\.html$/, `-${stamp}.html`);
    }
    used.add(name);
    files.push({ name, content: page.html, type: 'text/html' });
  }
  if (!files.length) files.push({ name: 'index.html', content: '', type: 'text/html' });

  if (target === 'vercel') {
    files.push({
      name: 'vercel.json',
      content: JSON.stringify({ version: 2, cleanUrls: true, trailingSlash: false }, null, 2),
      type: 'application/json',
    });
  }
  if (target === 'docker' || target === 'railway') {
    files.push({ name: 'Dockerfile', content: DOCKERFILE, type: 'text/plain' });
    files.push({ name: 'nginx.conf', content: NGINX, type: 'text/plain' });
  }
  if (target === 'railway') {
    files.push({
      name: 'railway.json',
      content: JSON.stringify({ build: { builder: 'DOCKERFILE' }, deploy: { restartPolicyType: 'ON_FAILURE' } }, null, 2),
      type: 'application/json',
    });
  }
  if (target === 'github_pages') {
    files.push({ name: 'deploy.yml', content: GITHUB_WORKFLOW, type: 'text/plain' });
  }

  files.push({ name: 'manifest.json', content: JSON.stringify(manifest, null, 2), type: 'application/json' });
  return files;
}