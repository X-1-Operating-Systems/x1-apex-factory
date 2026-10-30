// SaaS + Agency template archetypes.

export const saas = {
  category: 'saas',
  accents: ['#1d4ed8', '#0f766e', '#4338ca', '#0e7490', '#7c3aed', '#0284c7'],
  images: [
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80',
  ],
  names: [
    'Meridian', 'Northwind', 'Lattice', 'Beacon', 'Cobalt', 'Quanta', 'Vantage', 'Relay',
    'Signalcraft', 'Orbital', 'Parallel', 'Sift', 'Tidewater', 'Vertex', 'Wildcard', 'Zenith',
    'Atlas Grid', 'Bright Loop',
  ],
  plans: [
    { name: 'Starter', price: '$0', period: 'forever', cta: 'Start free', features: ['One workspace', 'Core dashboards', 'Community support'] },
    { name: 'Team', price: '$29', period: 'per seat / month', cta: 'Start a trial', features: ['Unlimited projects', 'Shared views and alerts', 'Priority support'] },
    { name: 'Scale', price: 'Talk to us', period: 'annual', cta: 'Book a call', features: ['SSO and audit logs', 'Custom data retention', 'Dedicated engineer'] },
  ],
  archetypes: [
    {
      eyebrow: 'Product analytics',
      title: 'See what your product is actually doing',
      sub: 'Event tracking, funnels and retention in one workspace, with answers you can act on the same day.',
      stats: [['4.2B', 'events processed monthly'], ['< 200ms', 'median query time'], ['1,900+', 'product teams onboard']],
      features: [
        ['Instrument once', 'A single schema across web, iOS and Android, so every team reads the same numbers.'],
        ['Ask in plain English', 'Type a question about a funnel and get the chart, the filter logic and the SQL behind it.'],
        ['Watch the whole journey', 'Sessions, cohorts and retention sit next to the event stream instead of in four tools.'],
        ['Ship with evidence', 'Every release links to its own metric view, so a rollback decision takes minutes.'],
      ],
      showcase: {
        title: 'Built for the Monday question',
        body: 'When someone asks why activation dropped, the answer should be a link, not a data request.',
        bullets: ['Reusable cohort definitions', 'Anomaly notes attached to each metric', 'Shareable views with saved filters'],
      },
      faq: [
        ['How long does setup take?', 'Most teams send their first events within an afternoon using the snippet or the SDK.'],
        ['Do you sample data?', 'No. Queries run against the full event store, so segment sizes stay exact.'],
        ['Can we keep data in our region?', 'Workspaces choose a US or EU data region at creation and can migrate with support.'],
      ],
      cta: { title: 'Bring your first event in today', body: 'Connect a source and see a real funnel before you talk to anyone.', cta: 'Start free' },
      text: { title: 'Why exact numbers matter', body: 'Sampled analytics quietly break trust. When two teams quote different activation rates, the argument costs more than the tool. This workspace runs on an unsampled store with a documented metric definition per event.' },
    },
    {
      eyebrow: 'Developer infrastructure',
      title: 'Ship backend changes without holding your breath',
      sub: 'Preview environments, guarded migrations and rollback on every deploy, wired into the tools your team already uses.',
      stats: [['11 min', 'median time from merge to live'], ['99.98%', 'API availability last year'], ['3,400', 'services in production']],
      features: [
        ['Preview every branch', 'Each pull request gets a disposable environment with seeded data and its own URL.'],
        ['Migrations that can reverse', 'Schema changes ship with a tested rollback path and a dry-run report.'],
        ['Guardrails, not gates', 'Policy checks block the dangerous diffs and leave the routine ones alone.'],
        ['Trace across services', 'One request ID follows a call from edge to queue to database.'],
      ],
      showcase: {
        title: 'The boring release is the good release',
        body: 'Deploys stop being events. The pipeline handles the checks, the canary and the rollback, and the team keeps working.',
        bullets: ['Canary traffic in ten percent steps', 'Automatic rollback on error budget burn', 'Deploy notes posted to your channel'],
      },
      faq: [
        ['Which clouds are supported?', 'AWS, GCP and Azure today, with a bring-your-own Kubernetes path for private networks.'],
        ['Does it replace our CI?', 'No. It plugs into existing pipelines and adds environment and rollback handling.'],
        ['How are secrets handled?', 'Secrets live in your cloud secret manager and are injected at runtime, never stored here.'],
      ],
      cta: { title: 'Point it at one repo and see', body: 'A single service is enough to judge whether this fits how your team ships.', cta: 'Connect a repo' },
      text: { title: 'What good deploy hygiene looks like', body: 'Small diffs, fast feedback, a known rollback path and an owner for each service. Everything in this system exists to make those four things the default rather than a habit someone has to remember.' },
    },
    {
      eyebrow: 'Team operations',
      title: 'One place for the work behind the work',
      sub: 'Requests, approvals and handoffs move through a single queue, so nothing stalls in a chat thread.',
      stats: [['38%', 'less time in status meetings'], ['2.4 days', 'faster average approval'], ['6,000+', 'teams coordinating here']],
      features: [
        ['Intake that routes itself', 'Requests land with the right owner, priority and due date from the first message.'],
        ['Approvals with context', 'Reviewers see the history, the attachments and the policy in one panel.'],
        ['Handoffs that stay visible', 'Work moves between teams without losing the thread that explains the decision.'],
        ['A weekly summary people read', 'One digest covers what shipped, what is blocked and what needs a decision.'],
      ],
      showcase: {
        title: 'Fewer meetings, same alignment',
        body: 'Status lives in the record. The meeting becomes a place for decisions instead of a readout.',
        bullets: ['Queue views per team and per client', 'SLA timers on every stage', 'Decision log attached to each item'],
      },
      faq: [
        ['Can we import existing requests?', 'Yes, CSV import maps your columns to intake fields and preserves timestamps.'],
        ['Does it work across time zones?', 'Due dates resolve in each assignee local time, with a shared calendar view.'],
        ['What about guest clients?', 'Client-visible items share only the messages and files you mark for them.'],
      ],
      cta: { title: 'Move one queue over this week', body: 'Start with the process that generates the most pings, then expand.', cta: 'Open a workspace' },
      text: { title: 'Built around the handoff', body: 'Most operational drag hides between teams, not inside them. The queue is designed so the moment work changes hands is explicit, timed and readable by everyone downstream.' },
    },
  ],
};

export const agency = {
  category: 'agency',
  accents: ['#b4532a', '#111827', '#0f766e', '#7c2d12', '#1e293b', '#a16207'],
  images: [
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
  ],
  names: [
    'Foundry', 'Northline', 'Paper and Pitch', 'Rivet', 'Studio Kestrel', 'Tenfold', 'Broadside', 'Cadence',
    'Fieldnote', 'Halcyon', 'Ironwood', 'Marrow', 'Ovation', 'Signal House', 'Thesis', 'Undertow',
    'Vellum', 'Westbound',
  ],
  plans: [
    { name: 'Sprint', price: '$8k', period: 'two weeks', cta: 'Book a sprint', features: ['One focused problem', 'Senior team only', 'Working deliverable'] },
    { name: 'Engagement', price: '$18k', period: 'per month', cta: 'Start an engagement', features: ['Brand and site together', 'Weekly working sessions', 'Full source files'] },
    { name: 'Partner', price: 'By scope', period: 'quarterly', cta: 'Talk to a partner', features: ['Retained design lead', 'Quarterly roadmap', 'Embedded with your team'] },
  ],
  archetypes: [
    {
      eyebrow: 'Brand and identity',
      title: 'A brand that survives contact with reality',
      sub: 'Positioning, identity and the system that keeps it consistent across every surface you ship.',
      stats: [['14', 'years of studio practice'], ['60+', 'identities brought to market'], ['9', 'people in the core team']],
      features: [
        ['Positioning first', 'We start with the decision your buyer is trying to make, then design for it.'],
        ['Identity with rules', 'Type, colour and layout defined in a system your team can extend without us.'],
        ['Applications that ship', 'Site, deck, packaging and social built alongside the mark, not months later.'],
        ['Handover that holds', 'Documented components and a working session with whoever maintains it.'],
      ],
      showcase: {
        title: 'Work that survives the second year',
        body: 'An identity is judged long after launch, when the templates are stale and a new hire has to make a call alone.',
        bullets: ['Written voice guidelines with examples', 'Component library in Figma and code', 'Quarterly consistency review'],
      },
      faq: [
        ['How long is a full identity?', 'Typically eight to ten weeks, with two review points and one round of refinement.'],
        ['Do you work with in-house teams?', 'Most of our engagements are collaborative, with your designers in the same files.'],
        ['What do we own at the end?', 'Everything: source files, fonts licensing guidance and the documented system.'],
      ],
      cta: { title: 'Tell us what is not working', body: 'A short call is enough to know whether this is a brand problem or a messaging one.', cta: 'Start a conversation' },
      text: { title: 'Why we start with the buyer', body: 'Beautiful work that answers the wrong question is expensive decoration. Every project opens with interviews, a competitive read and one sentence the whole business agrees on.' },
    },
    {
      eyebrow: 'Growth and performance',
      title: 'Marketing that reports honestly',
      sub: 'Channel strategy, creative and measurement run by one team, with the numbers visible to you every week.',
      stats: [['3.1x', 'median return on ad spend'], ['47%', 'average drop in cost per lead'], ['12', 'accounts at capacity']],
      features: [
        ['One measurement model', 'Attribution, pipeline and blended cost live in a single dashboard you can open anytime.'],
        ['Creative built to be tested', 'Every concept ships in variants so the winner is decided by data, not opinion.'],
        ['Landing pages that convert', 'Pages built and shipped in days, then iterated on real traffic.'],
        ['Weekly, not monthly', 'You see spend, results and the next decision while the week is still live.'],
      ],
      showcase: {
        title: 'The report you would write yourself',
        body: 'No vanity charts. Spend, cost per qualified lead, and the two things we are changing next week.',
        bullets: ['Qualified-lead definitions agreed upfront', 'Creative library with performance notes', 'Budget shifts explained in plain language'],
      },
      faq: [
        ['What is the minimum spend?', 'We work with accounts spending from $15k per month upward, plus management.'],
        ['Do you produce the creative?', 'Yes, static and short-form video, produced in-house and tested in market.'],
        ['When do we see results?', 'First read at three weeks, a defensible trend by week eight.'],
      ],
      cta: { title: 'Get a channel read before you commit', body: 'We will audit your current account and show where the waste is.', cta: 'Request an audit' },
      text: { title: 'What we refuse to do', body: 'We do not report clicks as success, hide spend in spreadsheets, or take a client whose product we would not recommend. Those three rules cost us deals and keep the rest of the work honest.' },
    },
    {
      eyebrow: 'Product design',
      title: 'Interfaces your customers finish using',
      sub: 'Research, flows and shipped UI for software teams that need the product to feel as considered as the pitch.',
      stats: [['26', 'products designed to date'], ['4.8/5', 'average post-launch usability score'], ['2 wks', 'typical time to first prototype']],
      features: [
        ['Research that narrows', 'Five conversations usually beat a fifty-page survey, and we run them first.'],
        ['Prototypes in the browser', 'Clickable in days so the argument is about behaviour, not mockups.'],
        ['Systems your devs keep', 'Components, tokens and states handed over in the stack you actually use.'],
        ['Post-launch read', 'We watch real sessions after release and fix the first three frictions.'],
      ],
      showcase: {
        title: 'Design decisions with names attached',
        body: 'Every flow gets a written rationale, so future changes start from the reason and not the screenshot.',
        bullets: ['Research notes per flow', 'Component states documented', 'Accessibility pass before handoff'],
      },
      faq: [
        ['Do you work in our repo?', 'Often yes. Designers commit to the component library alongside your engineers.'],
        ['Can you take a brief we already wrote?', 'Yes, though we will usually test the assumptions in it before designing.'],
        ['How do you handle handoff?', 'A working session plus a recorded walkthrough of every state, not a file drop.'],
      ],
      cta: { title: 'Show us the screen that frustrates people', body: 'We will tell you whether it is a flow problem or a visual one.', cta: 'Send a screen' },
      text: { title: 'On designing for completion', body: 'A finished task is the only signal that matters. That is why we measure flows by drop-off, not by how the first screen looks in a portfolio.' },
    },
  ],
};