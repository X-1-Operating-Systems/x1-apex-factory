// Portfolio + Commerce template archetypes.

export const portfolio = {
  category: 'portfolio',
  accents: ['#111827', '#7c2d12', '#1e3a8a', '#4c1d95', '#065f46', '#9f1239'],
  images: [
    'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
  ],
  names: [
    'Ada Voss', 'Studio Lune', 'Kite and Clay', 'Miro Salter', 'Paper Atlas', 'Nell Okonjo', 'Field Office', 'Grain Studio',
    'Iris Bell', 'Coldhouse', 'Juno Park', 'Longform', 'Margot Rey', 'North Six', 'Ora Studio', 'Pine and Pitch',
    'Quiet Hours', 'Sonder Works',
  ],
  plans: [
    { name: 'Portrait sitting', price: '$650', period: 'half day', cta: 'Check dates', features: ['Two hours on location', '25 edited frames', 'Print release'] },
    { name: 'Editorial commission', price: '$1,800', period: 'per day', cta: 'Request a day rate', features: ['Full day coverage', 'Same-week selects', 'Usage licence'] },
    { name: 'Retainer', price: 'By arrangement', period: 'monthly', cta: 'Start a conversation', features: ['Monthly shoot day', 'Priority scheduling', 'Archive access'] },
  ],
  archetypes: [
    {
      eyebrow: 'Photographer',
      title: 'Light, space, and the moment someone forgets the camera',
      sub: 'Portraits, interiors and editorial commissions shot on location, delivered in two weeks.',
      stats: [['120+', 'commissions completed'], ['2 wks', 'average delivery'], ['12', 'editorial clients']],
      features: [
        ['Direction without posing', 'I give people something to do instead of somewhere to stand.'],
        ['Natural light first', 'Strobe only when the room demands it, so the result still feels like the place.'],
        ['A selects process you control', 'A proofing gallery within 48 hours, then the edit list is yours.'],
        ['Files that last', 'Delivered as print-ready TIFFs and web JPEGs, archived for three years.'],
      ],
      showcase: {
        title: 'Recent: a house in the hills',
        body: 'A two-day interior commission shot as the light moved through the rooms.',
        bullets: ['Architectural Digest feature', '48 final frames', 'Shot entirely on available light'],
      },
      faq: [
        ['Do you travel?', 'Yes, anywhere, with travel billed at cost and no markup.'],
        ['Who owns the images?', 'You license what we agree in writing; I retain portfolio use unless you object.'],
        ['Can you match a reference?', 'Usually. Send the reference at booking so the plan accounts for it.'],
      ],
      cta: { title: 'Booking three weeks out', body: 'Tell me the space, the light and the deadline.', cta: 'Check availability' },
      text: { title: 'On working quietly', body: 'The best frames usually arrive ten minutes after everyone stops performing. My job is to make that ten minutes happen sooner.' },
    },
    {
      eyebrow: 'Designer',
      title: 'Interfaces and identities for people who sweat the details',
      sub: 'Independent design practice working with founders and small teams on product, brand and the space between.',
      stats: [['9', 'years independent'], ['40', 'projects shipped'], ['4', 'client slots per quarter']],
      features: [
        ['One project at a time', 'You work with me directly, start to finish, with no handoff to a junior team.'],
        ['Design in the browser', 'Real components, real type rendering, tested at real widths.'],
        ['A system, not a screen', 'Tokens and rules your team can extend after the engagement ends.'],
        ['Written rationale', 'Each decision has a reason attached, so it survives the next stakeholder.'],
      ],
      showcase: {
        title: 'Selected work: a booking flow',
        body: 'Rebuilt a four-step checkout into one screen with progressive disclosure, cutting abandonment.',
        bullets: ['Drop-off down 31 percent', 'Shipped in six weeks', 'Component library handed over'],
      },
      faq: [
        ['What do you charge?', 'Project fees from $12k, priced before work starts with no hourly surprises.'],
        ['Do you do small jobs?', 'Occasionally, if it is a discrete problem with a clear decision inside it.'],
        ['Can you work with our engineers?', 'Preferably. The best work happens in the same repo, in the same week.'],
      ],
      cta: { title: 'Two slots open this quarter', body: 'Send a short note about the problem, not the brief.', cta: 'Start a project' },
      text: { title: 'Why independent', body: 'No account layer, no junior bench, no deck written to sell work I will not do myself. It limits how many projects I take and raises what each one gets.' },
    },
    {
      eyebrow: 'Architect',
      title: 'Small buildings, resolved in detail',
      sub: 'Residential and studio-scale architecture with a focus on daylight, material honesty and tight budgets.',
      stats: [['21', 'built projects'], ['18', 'awards and mentions'], ['3', 'in construction now']],
      features: [
        ['Budget-led design', 'Cost is a design input from day one, tracked against the model each month.'],
        ['Daylight studies', 'Every scheme is tested through a full year before the plan is fixed.'],
        ['Local material', 'Stone, timber and lime sourced within the region wherever possible.'],
        ['On site weekly', 'Drawings are not the end of the work; supervision is part of the fee.'],
      ],
      showcase: {
        title: 'House at the edge of the field',
        body: 'A single-storey home built around a courtyard, designed for a shrinking household.',
        bullets: ['Completed on a fixed budget', 'Air-tightness twice the standard', 'Courtyard handles all rainwater'],
      },
      faq: [
        ['Do you take extensions?', 'Yes, and they are often the most interesting briefs we get.'],
        ['What are typical fees?', 'Twelve to fifteen percent of build cost, staged across the project.'],
        ['Can you recommend a builder?', 'Three tenders minimum, from a list we have worked with before.'],
      ],
      cta: { title: 'Talk through a site', body: 'Bring the plot details and an honest budget range.', cta: 'Book a call' },
      text: { title: 'Buildings that age well', body: 'We choose materials that improve with weather, and details that a local tradesperson can repair in twenty years without a specialist.' },
    },
  ],
};

export const commerce = {
  category: 'commerce',
  accents: ['#0f172a', '#7c2d12', '#166534', '#831843', '#1e40af', '#a16207'],
  images: [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80',
  ],
  names: [
    'Quiet Goods', 'Nettle and Flame', 'Marlowe Supply', 'Two Rivers', 'Standard Issue', 'Halden Studio', 'Juniper Goods', 'Kiln and Co',
    'Loom House', 'Salt and Smoke', 'Rook Supply', 'Bracken', 'Cedar Lane', 'Worn Well', 'Sunday Goods', 'Ash and Ember',
    'Field Supply', 'Tanner and Tide',
  ],
  plans: [
    { name: 'Single item', price: 'From $48', period: 'per piece', cta: 'Shop now', features: ['Free shipping over $75', '30-day returns', 'Two-year guarantee'] },
    { name: 'The set', price: '$180', period: 'bundle', cta: 'Add the set', features: ['Three pieces', 'Save 15 percent', 'Gift boxing included'] },
    { name: 'Trade account', price: 'By approval', period: 'wholesale', cta: 'Apply for trade', features: ['Tiered pricing', 'Net 30 terms', 'Sample pack'] },
  ],
  archetypes: [
    {
      eyebrow: 'Small-batch homeware',
      title: 'Made slowly, used daily',
      sub: 'Ceramics, linen and wooden pieces made in small runs by people we can name.',
      stats: [['4', 'makers we work with'], ['3x', 'yearly production runs'], ['98%', 'orders shipped in 24 hours']],
      features: [
        ['Small runs, no deadstock', 'We make what sells and restock when it does, so nothing ends up discounted.'],
        ['Repairable by design', 'Handles, cords and lids are replaceable rather than glued shut.'],
        ['Packaging you can compost', 'Pulp inserts, paper tape and no plastic in the box.'],
        ['Named makers', 'Every product page lists who made it and where the material came from.'],
      ],
      showcase: {
        title: 'A glaze we spent a year on',
        body: 'The matte finish you see is the eleventh trial. It still varies slightly batch to batch, which is the point.',
        bullets: ['Food-safe and dishwasher tested', 'Fired twice at cone six', 'Seconds sold at a fair price'],
      },
      faq: [
        ['Where do you ship?', 'Everywhere in the US and Canada, with flat international rates at checkout.'],
        ['What if it breaks?', 'Send a photo within 30 days and we replace it, no return required.'],
        ['Do you restock sold-out items?', 'Most runs return within eight weeks; the newsletter announces each one.'],
      ],
      cta: { title: 'The autumn run is out now', body: 'Limited quantities, made once, shipped within a day.', cta: 'Shop the collection' },
      text: { title: 'Why the prices are what they are', body: 'Fair pay for the maker, honest materials and short runs cost more than mass production. We would rather explain the number than hide it.' },
    },
    {
      eyebrow: 'Apparel',
      title: 'Clothes that outlive the season',
      sub: 'Heavyweight basics cut for real bodies, produced twice a year in limited runs.',
      stats: [['3 yrs', 'average garment life in review'], ['2', 'production cycles a year'], ['30', 'day no-questions returns']],
      features: [
        ['Fabric first', 'Every style starts with the mill and the weight, not the trend board.'],
        ['Sized by measurement', 'Full measurement charts per garment, with fit notes from two body types.'],
        ['Repairs offered free', 'Send it back for mending at any point in the first two years.'],
        ['Produced in limited runs', 'We do not overproduce to chase a discount, so the price stays honest.'],
      ],
      showcase: {
        title: 'The one shirt, worn 200 times',
        body: 'A workwear poplin with a reinforced placket, tested by three people for a full season before release.',
        bullets: ['Pre-shrunk and enzyme washed', 'Sewn in a family-run factory', 'Buttons sourced in Italy'],
      },
      faq: [
        ['How does sizing run?', 'True to measurement with a relaxed shoulder, sized for layering.'],
        ['Do you restock?', 'Core styles return each season; seasonal colours do not.'],
        ['Can I exchange a worn item?', 'Yes within 30 days, and repairs are free for two years.'],
      ],
      cta: { title: 'Find your fit once', body: 'The measurement guide takes two minutes with a tape.', cta: 'Shop the range' },
      text: { title: 'On not chasing trends', body: 'A wardrobe built from a few good garments costs less over five years than a rotation of cheap ones, and it removes a decision from every morning.' },
    },
    {
      eyebrow: 'Specialty food',
      title: 'A pantry worth clearing space for',
      sub: 'Single-origin coffee, tinned fish and pantry staples chosen for how they taste on a Tuesday.',
      stats: [['48', 'products, deliberately few'], ['Roasted', 'to order each week'], ['2 days', 'typical dispatch']],
      features: [
        ['Tasted before listed', 'Nothing goes on the shelf until three of us have cooked with it.'],
        ['Roasted to order', 'Coffee leaves the roastery within a day of your order being packed.'],
        ['Short ingredient lists', 'If a label needs a legend, it does not get stocked.'],
        ['Bundle pricing that adds up', 'Sets are priced lower than the sum, with a real saving shown.'],
      ],
      showcase: {
        title: 'The starter shelf',
        body: 'Six things that make a week of cooking better: oil, salt, anchovy, chilli, beans, coffee.',
        bullets: ['Recipes included with each set', 'Shelf-stable for a year', 'Refill options on staples'],
      },
      faq: [
        ['How fresh is the coffee?', 'Roasted the week you order, dated on the bag, best from day five.'],
        ['Do you offer subscriptions?', 'Yes, pause or skip anytime and change the grind before each send.'],
        ['Is shipping free?', 'Over $75 in the continental US; flat rate everywhere else.'],
      ],
      cta: { title: 'Build your starter shelf', body: 'Six staples, one box, priced below the individual items.', cta: 'Shop the pantry' },
      text: { title: 'A short shelf, on purpose', body: 'A hundred products means a hundred half-finished jars. We keep the range small so everything on it earns its place in a normal week of cooking.' },
    },
  ],
};