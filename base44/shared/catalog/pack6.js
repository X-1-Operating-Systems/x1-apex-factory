// Event + Editorial template archetypes.

export const event = {
  category: 'event',
  accents: ['#7c2d12', '#1e3a8a', '#4c1d95', '#065f46', '#9f1239', '#a16207'],
  images: [
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
  ],
  names: [
    'Assembly', 'The Long Table', 'Founders Hall', 'Field Day', 'Signal Conference', 'Harvest Dinner', 'Lantern Nights', 'Northlight Sessions',
    'Open Studio Weekend', 'Craft and Kiln Fair', 'Riverlight Festival', 'Stone Hall Lectures', 'The Makers Market', 'Summit Sessions', 'Under the Arches', 'Vine and Verse',
    'Wellspring Retreat', 'Winterlight',
  ],
  plans: [
    { name: 'Single ticket', price: '$65', period: 'per person', cta: 'Buy a ticket', features: ['Full day access', 'Lunch included', 'Recordings afterwards'] },
    { name: 'Pair', price: '$115', period: 'two people', cta: 'Bring a guest', features: ['Two tickets', 'Reserved seating', 'Drinks reception'] },
    { name: 'Patron', price: '$350', period: 'per person', cta: 'Become a patron', features: ['All sessions', 'Supper with speakers', 'Named in the programme'] },
  ],
  archetypes: [
    {
      eyebrow: 'One-day conference',
      title: 'Twelve talks, one room, no filler',
      sub: 'A single-track day for people building small companies, with the talks published in advance.',
      stats: [['1', 'stage, no parallel tracks'], ['240', 'seats'], ['12', 'speakers confirmed']],
      features: [
        ['Single track', 'No choosing between sessions, and no missing the good one.'],
        ['Practical talks', 'Each speaker presents something they have actually shipped.'],
        ['Long breaks', 'Forty minutes between blocks so conversations get a chance to start.'],
        ['Recordings included', 'Every session filmed and sent to attendees within a week.'],
      ],
      showcase: {
        title: 'The day, hour by hour',
        body: 'Doors at nine, four talk blocks, supper at six. The full running order goes live a month ahead.',
        bullets: ['Lunch and supper included', 'Quiet room available all day', 'Accessible venue throughout'],
      },
      faq: [
        ['What is the refund policy?', 'Full refund up to fourteen days before, transferable after that.'],
        ['Are talks recorded?', 'Yes, and shared with ticket holders within a week.'],
        ['Is the venue accessible?', 'Step-free throughout with hearing loop in the main room.'],
      ],
      cta: { title: 'Tickets for the next edition', body: 'Two hundred and forty seats, released in two batches.', cta: 'Buy a ticket' },
      text: { title: 'Why one track', body: 'Parallel tracks force people to choose and then wonder. One stage means the whole room shares the same reference points by the end of the day.' },
    },
    {
      eyebrow: 'Supper club',
      title: 'One long table, one menu, once a month',
      sub: 'A monthly dinner for thirty people, cooked in the room, with no menu choices and no phones on the table.',
      stats: [['30', 'seats each month'], ['One', 'menu, cooked on site'], ['7pm', 'seated, sharp']],
      features: [
        ['A single menu', 'Four courses, seasonal, with dietary needs handled when you book.'],
        ['Cooked in front of you', 'The kitchen is in the room; nothing is plated elsewhere.'],
        ['Table of thirty', 'One long table, so the room talks to itself by the second course.'],
        ['Wine included', 'A short list poured freely, with a non-alcoholic pairing available.'],
      ],
      showcase: {
        title: 'How the evening runs',
        body: 'Drinks at seven, seated at half past, four courses with a break before pudding, out by eleven.',
        bullets: ['Monthly, usually the second Thursday', 'Dietaries handled at booking', 'Tickets released three weeks ahead'],
      },
      faq: [
        ['Can I book a single seat?', 'Yes, most guests do, and the seating plan mixes tables.'],
        ['What if I cannot eat something?', 'Tell us at booking and the kitchen writes around it.'],
        ['Can we book the whole table?', 'Twice a year, for private hire, on request.'],
      ],
      cta: { title: 'Next dinner is nearly full', body: 'Six seats remain for the coming sitting.', cta: 'Reserve a seat' },
      text: { title: 'On sitting with strangers', body: 'The first ten minutes are awkward and the next three hours are the reason people come back. A shared table does something a restaurant table cannot.' },
    },
    {
      eyebrow: 'Workshop series',
      title: 'Two days, one skill, taken home',
      sub: 'Small-cohort workshops where you leave with a finished object and the method to make another.',
      stats: [['10', 'people per cohort'], ['2', 'days on site'], ['All', 'materials included']],
      features: [
        ['Ten people maximum', 'Enough hands-on time for the tutor to reach everyone twice a day.'],
        ['Materials included', 'Everything is on the bench when you arrive, sourced and prepared.'],
        ['A finished piece', 'You leave with the object, not a photograph of one.'],
        ['Written method', 'A printed guide and a tools list so you can repeat it at home.'],
      ],
      showcase: {
        title: 'A weekend on the bench',
        body: 'Day one covers material and technique. Day two is spent making, with the tutor at your shoulder.',
        bullets: ['All tools provided', 'Lunch both days', 'Follow-up session by video'],
      },
      faq: [
        ['Do I need experience?', 'No. Beginners are the standard case for the introductory weekends.'],
        ['Can I buy tools on site?', 'A starter kit is available at cost on the final afternoon.'],
        ['Are there payment plans?', 'A deposit holds your place, with the balance due two weeks before.'],
      ],
      cta: { title: 'Three places left this cohort', body: 'Cohorts run monthly from March to November.', cta: 'Book a place' },
      text: { title: 'Why cohorts stay at ten', body: 'Ten is the number of people one tutor can genuinely correct. Above that, someone spends two days watching, and the fee stops being worth it.' },
    },
  ],
};

export const editorial = {
  category: 'editorial',
  accents: ['#111827', '#7c2d12', '#1e3a8a', '#3f6212', '#4c1d95', '#831843'],
  images: [
    'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
  ],
  names: [
    'The Field Journal', 'Longform Quarterly', 'Northlight Review', 'The Slow Press', 'Marginalia', 'The Civic Review', 'Paper Trail', 'The Quiet Column',
    'Rivet Magazine', 'The Long Read', 'Second Draft', 'The Coastal Review', 'The Archive', 'Threshold', 'The Weekly Dispatch', 'Grain Magazine',
    'The Ledger', 'Annotated',
  ],
  plans: [
    { name: 'Digital', price: '$6', period: 'per month', cta: 'Subscribe', features: ['Every issue', 'Full archive', 'Weekly dispatch'] },
    { name: 'Print', price: '$68', period: 'per year', cta: 'Subscribe in print', features: ['Four issues posted', 'Digital included', 'Supporter rate available'] },
    { name: 'Patron', price: '$240', period: 'per year', cta: 'Become a patron', features: ['Print and digital', 'Annual letter', 'Event invitations'] },
  ],
  archetypes: [
    {
      eyebrow: 'Literary magazine',
      title: 'Long writing, read slowly',
      sub: 'Essays, reportage and criticism in four issues a year, with new work online each week.',
      stats: [['4', 'issues a year'], ['38', 'writers published so far'], ['No', 'advertising, ever']],
      features: [
        ['Editors, not algorithms', 'Every piece is commissioned or chosen by a named editor who reads the slush pile.'],
        ['Paid contributors', 'Rates published on the submissions page, paid on acceptance.'],
        ['Reader funded', 'Subscriptions and patrons cover the whole budget.'],
        ['An archive worth keeping', 'Everything published stays free to read after its first month.'],
      ],
      showcase: {
        title: 'What we publish',
        body: 'Three thousand to eight thousand words on a subject the writer cannot stop thinking about.',
        bullets: ['Pitches answered within three weeks', 'Two editorial passes', 'Design by a single hand'],
      },
      faq: [
        ['Do you accept pitches?', 'Yes, from anyone, with guidelines published and answers within three weeks.'],
        ['Is the archive free?', 'Every issue older than a month opens to all readers.'],
        ['Who owns the copyright?', 'Contributors keep it; we take first serial rights only.'],
      ],
      cta: { title: 'Read the current issue', body: 'Four pieces, one long weekend of reading.', cta: 'Start reading' },
      text: { title: 'On paying writers', body: 'A magazine that does not pay its contributors is asking them to fund it. Our rates are modest and published, and they are never zero.' },
    },
    {
      eyebrow: 'City reportage',
      title: 'A city, examined street by street',
      sub: 'Independent reporting on housing, transport and the decisions that change a neighbourhood.',
      stats: [['9,000', 'weekly readers'], ['No', 'corporate ownership'], ['6', 'contributing reporters']],
      features: [
        ['Primary reporting', 'Documents, minutes and interviews, not press releases rewritten.'],
        ['Follow-ups by default', 'Stories return to the same question until it is answered.'],
        ['Public data, published', 'Every dataset we use is shared with the piece.'],
        ['Corrections in the open', 'Errors corrected on the page, with the date and what changed.'],
      ],
      showcase: {
        title: 'The housing series',
        body: 'Eighteen months tracking three developments from planning permission to occupancy.',
        bullets: ['Documents published beside each piece', 'Reader tip line checked weekly', 'Follow-up letters to every council'],
      },
      faq: [
        ['Who funds this?', 'Readers, plus a small foundation grant, both disclosed annually.'],
        ['How do I send a tip?', 'Through the encrypted form, with anonymity available on request.'],
        ['Can newsrooms reuse this?', 'Yes with credit, under a licence explained on the site.'],
      ],
      cta: { title: 'Support independent reporting', body: 'A monthly contribution funds one reporting day per hundred members.', cta: 'Become a member' },
      text: { title: 'Why we publish our sources', body: 'A claim you cannot check is a rumour with a byline. Wherever documents exist, they sit beside the story.' },
    },
    {
      eyebrow: 'Design criticism',
      title: 'What buildings and objects are really doing',
      sub: 'Criticism of architecture, interiors and the objects of everyday life, written by practitioners.',
      stats: [['72', 'essays published'], ['Quarterly', 'print edition'], ['3', 'editors, all practising']],
      features: [
        ['Critics who build', 'Every writer works in the field they cover, with the conflicts declared.'],
        ['Photography commissioned', 'Original images shot for each piece rather than pulled from press kits.'],
        ['Long captions', 'Images annotated so a reader can see what the argument refers to.'],
        ['No rankings', 'We write about why something works, not about which building won.'],
      ],
      showcase: {
        title: 'A recent essay',
        body: 'On the quiet failure of the new civic library: good intentions, three materials, one unsolved threshold.',
        bullets: ['Site visits documented', 'Interviews with the design team', 'Response invited from the architects'],
      },
      faq: [
        ['Do you accept pitches?', 'Yes, especially from people close to the making of a building.'],
        ['Is the print edition separate?', 'Print carries the long essays; the web carries shorter notes.'],
        ['Do you sell back issues?', 'Most remain available, with a full index in the archive.'],
      ],
      cta: { title: 'Subscribe to the quarterly', body: 'Four issues, posted, with digital access included.', cta: 'Subscribe' },
      text: { title: 'On criticism without cruelty', body: 'A bad review that is merely clever helps nobody. The useful version explains what the building tried and where the attempt failed.' },
    },
  ],
};