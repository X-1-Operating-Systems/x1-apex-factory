// Fitness + Professional services template archetypes.

export const fitness = {
  category: 'fitness',
  accents: ['#b91c1c', '#0f172a', '#166534', '#7c2d12', '#1d4ed8', '#a16207'],
  images: [
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80',
  ],
  names: [
    'Ironhouse', 'Northside Strength', 'The Barbell Room', 'Foundry Fitness', 'Cedar Athletics', 'Summit Conditioning', 'Anchor Gym', 'Blackline Training',
    'Copperfield Strength', 'Fieldhouse', 'Granite Athletics', 'Harbour Rowing', 'Kestrel Run Club', 'Lakeside Yoga', 'Maple Street Pilates', 'Oak and Iron',
    'Ridgeline Climbing', 'Stonebridge Boxing',
  ],
  plans: [
    { name: 'Drop-in', price: '$22', period: 'per session', cta: 'Book a class', features: ['Any class type', 'Kit provided', 'No commitment'] },
    { name: 'Monthly', price: '$145', period: 'per month', cta: 'Join now', features: ['Unlimited classes', 'Programming app access', 'One coached session monthly'] },
    { name: 'Coaching', price: '$280', period: 'per month', cta: 'Apply for coaching', features: ['Weekly one to one', 'Individual programme', 'Nutrition guidance'] },
  ],
  archetypes: [
    {
      eyebrow: 'Strength gym',
      title: 'Barbells, coaching and no mirrors full of noise',
      sub: 'Small-group strength training with a coach who writes your programme and watches every lift.',
      stats: [['6', 'lifters per class maximum'], ['14', 'coaches certified'], ['4.9', 'member rating']],
      features: [
        ['Programming that progresses', 'Six-week blocks with a written plan and a reason behind each session.'],
        ['Coaching at the rack', 'Cues during the lift, not a demonstration from across the room.'],
        ['Small classes', 'Six people maximum, so nobody trains unsupervised under a bar.'],
        ['Progress you can read', 'Lifts logged every session, with a review every six weeks.'],
      ],
      showcase: {
        title: 'What a session looks like',
        body: 'Ten minutes of preparation, one main lift with coached sets, then focused accessory work. Fifty minutes, done.',
        bullets: ['All equipment provided', 'Beginner induction included', 'Open 5:30am to 21:00'],
      },
      faq: [
        ['Do I need experience?', 'No. Every new member starts with a two-session induction.'],
        ['Is there a contract?', 'Monthly, cancel with two weeks notice, no joining fee.'],
        ['Can I bring my own chalk?', 'Yes, and your own belt if you prefer it.'],
      ],
      cta: { title: 'Book a free induction', body: 'Two sessions with a coach, no card required.', cta: 'Book the induction' },
      text: { title: 'Why small groups', body: 'A coach cannot see twelve lifts at once. Six is the number where every rep gets watched and corrected, which is the entire value of coached training.' },
    },
    {
      eyebrow: 'Run and conditioning',
      title: 'A training plan that fits a real week',
      sub: 'Coached running and conditioning for people with jobs, with optional in-person sessions.',
      stats: [['900+', 'runners coached'], ['3', 'group sessions weekly'], ['8 wks', 'typical race block']],
      features: [
        ['A plan around your week', 'Sessions place around the days you can actually train, not an ideal calendar.'],
        ['Group sessions that add value', 'Intervals and drills with a coach, not a social jog at an unknown pace.'],
        ['Pace from data, not ego', 'Threshold testing sets training zones so easy days are genuinely easy.'],
        ['Race-day logistics handled', 'Kit, pacing and warm-up planned before the week of the race.'],
      ],
      showcase: {
        title: 'The eight-week block',
        body: 'Base, build, sharpen, taper. The volume rises once, then the intensity does the work.',
        bullets: ['Two coached sessions weekly', 'Weekly plan in your inbox', 'Group long runs on Sundays'],
      },
      faq: [
        ['What pace do I need to start?', 'Comfortable at thirty minutes of continuous running.'],
        ['Are sessions outdoors?', 'Yes, meeting at the track or the river path, rain or shine.'],
        ['Can I do it remote?', 'Yes, the plan and coach check-ins work anywhere with a watch.'],
      ],
      cta: { title: 'Join the next block', body: 'Blocks start on the first Monday of each month.', cta: 'Join a block' },
      text: { title: 'On easy days', body: 'Most runners train too hard on easy days and too easy on hard ones. Separating the two is usually worth more than any supplement or shoe.' },
    },
    {
      eyebrow: 'Studio classes',
      title: 'A studio small enough to know your name',
      sub: 'Reformer Pilates, mobility and yoga in a room of twelve, taught by the same four people.',
      stats: [['12', 'reformers, no sharing'], ['4', 'teachers on the timetable'], ['6:30am', 'first class, weekdays']],
      features: [
        ['Twelve places, always', 'Every class is capped so the teacher can cue each person properly.'],
        ['Progressive class levels', 'Foundations, build and flow, so you know which room is right for you.'],
        ['Bundles that never expire', 'Buy ten sessions and use them over a year.'],
        ['Clean, warm, quiet', 'No music you have to shout over, and mats cleaned between classes.'],
      ],
      showcase: {
        title: 'Foundations before flow',
        body: 'New clients start with two foundations classes so the equipment and the cues are familiar.',
        bullets: ['Free first foundations class', 'Mat and props provided', 'Post-natal and pre-natal options'],
      },
      faq: [
        ['I have never done Pilates. Where do I start?', 'Foundations, offered three times a week, taught slowly.'],
        ['What is the cancellation policy?', 'Free until four hours before the class starts.'],
        ['Do you sell class packs?', 'Yes, single, ten-class and monthly unlimited.'],
      ],
      cta: { title: 'Take a free foundations class', body: 'One per person, bookable online up to two weeks ahead.', cta: 'Book your class' },
      text: { title: 'Why the room stays small', body: 'Pilates is a coaching conversation, not a workout to music. Twelve people is the most a teacher can watch, correct and still keep the room flowing.' },
    },
  ],
};

export const professional = {
  category: 'professional',
  accents: ['#0f172a', '#1e3a8a', '#065f46', '#7c2d12', '#4c1d95', '#334155'],
  images: [
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80',
  ],
  names: [
    'Harrow and Finch', 'Wexler Partners', 'Northgate Law', 'Fielding Accountancy', 'Aldridge Tax', 'Cobalt Advisory', 'Pemberton Legal', 'Ridley Bookkeeping',
    'Slate Consulting', 'Thorne and Vale', 'Winslow CPA', 'Ashby Immigration', 'Bracken Notaries', 'Cavendish Family Law', 'Dunmore Payroll', 'Easton Valuations',
    'Fairhaven Mediation', 'Grantham Compliance',
  ],
  plans: [
    { name: 'Consultation', price: '$180', period: 'per hour', cta: 'Book a consultation', features: ['Case review', 'Written summary', 'Fixed-fee quote after'] },
    { name: 'Fixed scope', price: 'Quoted', period: 'per matter', cta: 'Request a quote', features: ['Agreed scope', 'Staged payments', 'Named contact'] },
    { name: 'Retainer', price: '$1,200', period: 'per month', cta: 'Discuss a retainer', features: ['Priority response', 'Monthly review call', 'Document vault access'] },
  ],
  archetypes: [
    {
      eyebrow: 'Law firm',
      title: 'Plain advice, priced before you commit',
      sub: 'Commercial and family law for owner-managed businesses and the people who run them.',
      stats: [['22', 'years in practice'], ['Fixed', 'fees on most matters'], ['1', 'named partner per client']],
      features: [
        ['A quote you can hold us to', 'Scope, assumptions and the fee, agreed in writing before we start.'],
        ['Partner-led work', 'The person you meet is the person who does the work and signs it off.'],
        ['Advice in plain English', 'If the explanation needs a glossary, it is not finished.'],
        ['Deadlines watched', 'Every matter has a calendar owner and a weekly check.'],
      ],
      showcase: {
        title: 'A commercial contract review',
        body: 'We read the document, mark the risk, and give you a ranked list of what to negotiate and what to leave.',
        bullets: ['Fixed fee per review', 'Turnaround in five working days', 'Negotiation language supplied'],
      },
      faq: [
        ['Do you offer fixed fees?', 'On most commercial and family matters, yes, quoted after an initial review.'],
        ['Can we meet remotely?', 'Yes, by video or at the office, whichever you prefer.'],
        ['Will my matter be confidential?', 'Always, and a conflict check runs before any consultation.'],
      ],
      cta: { title: 'Request a scoping call', body: 'Twenty minutes with a partner, no charge, with a written quote after.', cta: 'Book a call' },
      text: { title: 'Why we quote first', body: 'Hourly billing makes the client hesitant about asking questions, which is when mistakes get expensive. A fixed scope lets you call as often as you need.' },
    },
    {
      eyebrow: 'Accountancy',
      title: 'Numbers that arrive before the deadline',
      sub: 'Bookkeeping, statutory accounts and tax for small companies, with monthly management figures.',
      stats: [['340', 'companies supported'], ['Monthly', 'management accounts as standard'], ['48 hrs', 'typical query response']],
      features: [
        ['Monthly figures, not annual', 'A short pack each month so a bad quarter is visible while it can still be fixed.'],
        ['One accountant, one number', 'The person who files your accounts is the person who answers your questions.'],
        ['Deadlines owned by us', 'Corporation tax, VAT and payroll dates are tracked and filed without chasing.'],
        ['Software that fits', 'We work in your existing stack, or set one up and train your team.'],
      ],
      showcase: {
        title: 'The monthly pack',
        body: 'Profit and loss, cash position, debtor ageing and three paragraphs on what it means. Ten minutes to read.',
        bullets: ['Filed accounts and tax included', 'VAT and payroll handled', 'Year-end meeting in person'],
      },
      faq: [
        ['Do you work with sole traders?', 'Yes, and with partnerships and limited companies.'],
        ['Can you take over mid-year?', 'Yes, with a handover from the previous accountant handled by us.'],
        ['What does it cost?', 'From $180 per month, quoted after we see the volume of transactions.'],
      ],
      cta: { title: 'Get a fixed monthly quote', body: 'Send your last set of accounts and we will price it properly.', cta: 'Request a quote' },
      text: { title: 'Why management accounts', body: 'Annual accounts are a historical record. Monthly figures are a steering wheel. Most of the value in hiring an accountant sits in the second one.' },
    },
    {
      eyebrow: 'Business advisory',
      title: 'A second opinion worth paying for',
      sub: 'Operations, pricing and succession advisory for businesses between two and fifty people.',
      stats: [['110', 'advisory engagements'], ['5 wks', 'typical diagnostic'], ['8', 'sectors covered']],
      features: [
        ['A diagnostic, not a deck', 'Five weeks of interviews and data, ending in three decisions worth making.'],
        ['Priced in outcomes', 'Fees tied to a defined project, with a written deliverable at the end.'],
        ['Implementation support', 'We stay for the quarter that matters, not just the recommendation.'],
        ['No jargon', 'Everything is explained in the language your team already uses.'],
      ],
      showcase: {
        title: 'How a diagnostic runs',
        body: 'Two weeks of interviews, two weeks of numbers, one week of testing the recommendation with the people affected.',
        bullets: ['Three prioritised decisions', 'Board-ready summary', 'Weekly working sessions'],
      },
      faq: [
        ['Do you take equity?', 'No. Fees only, so the advice stays independent.'],
        ['How big are your clients?', 'Mostly owner-managed businesses with ten to fifty staff.'],
        ['Can you help with succession?', 'Yes, including valuation, buyer preparation and handover planning.'],
      ],
      cta: { title: 'Book a diagnostic call', body: 'One hour to see whether the problem is what you think it is.', cta: 'Arrange a call' },
      text: { title: 'On saying no', body: 'We turn down work where the answer is obvious and the client already knows it. Paying someone to agree with you is the most expensive kind of advice.' },
    },
  ],
};