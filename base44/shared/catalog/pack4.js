// Real estate + Clinic template archetypes.

export const realEstate = {
  category: 'real_estate',
  accents: ['#1e3a8a', '#0f766e', '#7c2d12', '#334155', '#4c1d95', '#a16207'],
  images: [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80',
  ],
  names: [
    'Ridgeline Properties', 'Harbour and Vine', 'Northgate Realty', 'Alder Lane', 'Stonecrest Homes', 'Beacon Estates', 'Copperfield', 'Elm and Ivy',
    'Fairmount Group', 'Granite Row', 'Hillcrest Partners', 'Juniper Homes', 'Kestrel Property', 'Lakeshore Listings', 'Maple Row', 'Oakline',
    'Sable and Stone', 'Wexford Realty',
  ],
  plans: [
    { name: 'Buyer consult', price: 'Free', period: 'forty-five minutes', cta: 'Book a consult', features: ['Budget and area review', 'Financing introductions', 'No obligation'] },
    { name: 'Listing package', price: '2.5%', period: 'at close', cta: 'Request a valuation', features: ['Photography and floor plan', 'Staging consultation', 'Weekly reporting'] },
    { name: 'Relocation plan', price: 'By scope', period: 'per household', cta: 'Talk to us', features: ['Neighbourhood shortlist', 'School and commute data', 'Move coordination'] },
  ],
  archetypes: [
    {
      eyebrow: 'Residential brokerage',
      title: 'The right house is a shortlist, not a feed',
      sub: 'Buyer representation built around six streets that fit your life, not an inbox full of alerts.',
      stats: [['$412M', 'sold in the last three years'], ['11 days', 'median time to offer'], ['91%', 'list-to-sale ratio']],
      features: [
        ['A shortlist worth visiting', 'We narrow to six properties that match your criteria, then walk them together.'],
        ['Pricing with evidence', 'Comparable sales, days on market and buyer demand, shown in the report you get.'],
        ['Prepared for the offer', 'Financing, inspection and timeline mapped before you want to bid.'],
        ['Handoff after close', 'Contractors, movers and utilities introduced in your first week.'],
      ],
      showcase: {
        title: 'What a valuation appointment covers',
        body: 'Forty minutes on site, a written comparative analysis within two days, and a plan for the first week on market.',
        bullets: ['Photography and floor plan included', 'Staging note with the report', 'Weekly buyer feedback summary'],
      },
      faq: [
        ['Do you represent both sides?', 'Never in the same transaction. We take one side and say so early.'],
        ['How are showings arranged?', 'We coordinate around your schedule and attend every first visit.'],
        ['What is your commission?', 'Two and a half percent at close, with no upfront charges.'],
      ],
      cta: { title: 'Start with the six streets', body: 'Tell us the commute, the budget and what you refuse to compromise on.', cta: 'Book a consult' },
      text: { title: 'Why we cap our client list', body: 'A buyer deserves to be the only one on their agent’s phone that day. Capping active clients is why offers move in eleven days instead of five weeks.' },
    },
    {
      eyebrow: 'Property development',
      title: 'Homes built for the street they stand on',
      sub: 'Small developments of six to twenty homes, designed with the local architecture and sold directly.',
      stats: [['6', 'developments completed'], ['74', 'homes delivered'], ['0', 'unsold at completion']],
      features: [
        ['Local material palette', 'Brick, slate and timber chosen to match the surrounding streets.'],
        ['Energy bills in writing', 'Predicted running costs published with each home, not a vague rating.'],
        ['Direct from the builder', 'No layers between you and the people who built it.'],
        ['Two-year aftercare', 'A named contact who answers for two years after you move in.'],
      ],
      showcase: {
        title: 'Alder Lane: six homes, one courtyard',
        body: 'Two-bedroom houses around a shared garden, a five-minute walk from the station.',
        bullets: ['Air-source heat pumps throughout', 'Shared cycle store and garden', 'Finished and occupied'],
      },
      faq: [
        ['Can I choose finishes?', 'On plots released early, kitchens and flooring are selected from a fixed range.'],
        ['Is there a warranty?', 'Ten-year structural and two-year fit and finish, both transferable.'],
        ['Do you part-exchange?', 'Considered case by case on plots over a certain value.'],
      ],
      cta: { title: 'View the last two plots', body: 'Show home open Saturdays, or by appointment midweek.', cta: 'Book a viewing' },
      text: { title: 'Why we build small', body: 'Six homes means the same site manager sees every one of them through. That attention shows up in the details you find a year later, when the door still closes properly.' },
    },
    {
      eyebrow: 'Lettings and management',
      title: 'Management that answers the same day',
      sub: 'Full-service lettings for owners who want the rent handled and the maintenance done properly.',
      stats: [['310', 'doors under management'], ['4 hrs', 'average response time'], ['98%', 'rent collected on time']],
      features: [
        ['Repairs approved at a limit', 'Anything under the agreed threshold is handled without a call to you.'],
        ['Tenant screening with evidence', 'Income, references and previous landlord checks documented in the file.'],
        ['Quarterly inspections', 'Photographed visits with a short written condition report.'],
        ['Owner portal', 'Statements, invoices and certificates in one place, anytime.'],
      ],
      showcase: {
        title: 'The maintenance chain, visible',
        body: 'From the tenant report to the invoice, every step is logged so there is no argument about what was agreed.',
        bullets: ['Vetted contractor panel', 'Compliance certificates tracked', 'Rent guarantee option available'],
      },
      faq: [
        ['What is the management fee?', 'Eleven percent of rent collected, with no fee on empty months.'],
        ['Do you guarantee rent?', 'An optional rent guarantee covers void periods up to three months.'],
        ['How fast are repairs?', 'Emergencies attended within four hours; routine jobs inside five working days.'],
      ],
      cta: { title: 'Get a rental valuation', body: 'A fifteen-minute visit tells you the realistic achievable rent.', cta: 'Request a valuation' },
      text: { title: 'On treating tenants well', body: 'Well-treated tenants stay longer, damage less and pay on time. The economics of good management are not charity, they are the whole case.' },
    },
  ],
};

export const clinic = {
  category: 'clinic',
  accents: ['#0f766e', '#1d4ed8', '#7c2d12', '#065f46', '#475569', '#9f1239'],
  images: [
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
  ],
  names: [
    'Northside Dental', 'Alder Health', 'The Physio Rooms', 'Brightwater Clinic', 'Cedar Family Practice', 'Summit Orthodontics', 'Willow Dermatology', 'Harbour Physiotherapy',
    'Lakeview Medical', 'Maple Street Chiropractic', 'Newfield Podiatry', 'Oakridge ENT', 'Pinecrest Paediatrics', 'Riverbend Womens Health', 'Stonegate Optometry', 'Vale Nutrition',
    'Westbrook Sports Medicine', 'Yarrow Counselling',
  ],
  plans: [
    { name: 'New patient visit', price: '$95', period: 'forty minutes', cta: 'Book a visit', features: ['Full assessment', 'Written plan', 'No referral needed'] },
    { name: 'Treatment course', price: 'Quoted', period: 'per plan', cta: 'Request a plan', features: ['Staged pricing', 'Insurance paperwork', 'Progress review included'] },
    { name: 'Membership', price: '$29', period: 'per month', cta: 'Join the practice', features: ['Priority booking', 'Two check-ins yearly', 'Reduced visit fees'] },
  ],
  archetypes: [
    {
      eyebrow: 'Dental practice',
      title: 'Dentistry without the dread',
      sub: 'Calm rooms, plain explanations and a written plan before anything is booked.',
      stats: [['15', 'years in the neighbourhood'], ['4.9', 'average review score'], ['Same week', 'emergency slots held daily']],
      features: [
        ['A plan before treatment', 'You see the options, prices and timing in writing before deciding.'],
        ['Pain handled properly', 'Numbing that works, checked before we start, and a stop signal that always stops.'],
        ['Transparent pricing', 'A written estimate, with insurance submitted on your behalf.'],
        ['Evening appointments', 'Two late finishes a week for people who cannot take a morning off.'],
      ],
      showcase: {
        title: 'What the first visit covers',
        body: 'A full examination, digital x-rays where needed, and a conversation about what you actually want from your teeth.',
        bullets: ['Forty-minute appointment', 'No treatment sold on the day', 'Written plan within 48 hours'],
      },
      faq: [
        ['Do you take insurance?', 'We submit to all major providers and explain the gap before you commit.'],
        ['Is there an emergency line?', 'Registered patients reach a clinician out of hours, every day.'],
        ['Can nervous patients be sedated?', 'Yes, options from simple numbing to conscious sedation, discussed first.'],
      ],
      cta: { title: 'Book a first visit', body: 'Evening and Saturday slots open two weeks ahead.', cta: 'Book an appointment' },
      text: { title: 'Why we explain everything twice', body: 'Anxiety usually comes from not knowing what happens next. Every step is described before it starts, and again if you want it repeated.' },
    },
    {
      eyebrow: 'Physiotherapy',
      title: 'Rehab that gets you back to the thing you miss',
      sub: 'One-to-one physiotherapy with a plan built around your sport, your job and your week.',
      stats: [['45 min', 'every appointment, one to one'], ['12', 'years of clinical practice'], ['4 wks', 'median return to training']],
      features: [
        ['Full hour, one clinician', 'No handing you to an assistant halfway through the session.'],
        ['Hands-on plus homework', 'Treatment in the room and a short programme you can actually keep up.'],
        ['Measured progress', 'Range, strength and pain scores recorded so improvement is visible.'],
        ['Return-to-sport testing', 'A clearance session before you go back to full training.'],
      ],
      showcase: {
        title: 'Six weeks, mapped out',
        body: 'Week one settles the pain. Weeks two to four rebuild capacity. Week six tests it under load.',
        bullets: ['Video programme in your inbox', 'Direct access, no referral needed', 'Liaison with your coach or surgeon'],
      },
      faq: [
        ['Do I need a referral?', 'No, you can book directly; we will write to your GP with your consent.'],
        ['What should I wear?', 'Something you can move in. Changing rooms are on site.'],
        ['Can I claim on insurance?', 'We are recognised by major insurers and provide receipts same day.'],
      ],
      cta: { title: 'Get assessed this week', body: 'Most new patients are seen within three working days.', cta: 'Book an assessment' },
      text: { title: 'On doing the boring work', body: 'The exercises are unglamorous and they are the treatment. Sessions exist to make sure the programme is right, progressed correctly and actually being done.' },
    },
    {
      eyebrow: 'Family medicine',
      title: 'A doctor who remembers your family',
      sub: 'Same-day appointments for acute problems and unhurried annual reviews for everything else.',
      stats: [['Same day', 'urgent appointments held daily'], ['20 min', 'standard consultation'], ['6', 'clinicians on the team']],
      features: [
        ['Continuity of care', 'You see your own clinician wherever the schedule allows.'],
        ['Twenty-minute consultations', 'Enough time to ask the second question, which is usually the real one.'],
        ['Results explained in person', 'Nothing important arrives as a portal notification with no context.'],
        ['Care for the whole household', 'One record per family, with each person’s privacy preserved.'],
      ],
      showcase: {
        title: 'The annual review, done properly',
        body: 'Bloods, blood pressure, medication review and a conversation about what you want the next year to look like.',
        bullets: ['Forty-five minute appointment', 'Written summary afterwards', 'Referrals arranged same week'],
      },
      faq: [
        ['Do you accept new patients?', 'Yes, and the whole household can register at once.'],
        ['How do home visits work?', 'For patients who cannot travel, arranged through reception before 10am.'],
        ['Are you private or insurance based?', 'Both, with clear self-pay pricing published in advance.'],
      ],
      cta: { title: 'Register with the practice', body: 'Bring photo ID and your previous practice details.', cta: 'Register now' },
      text: { title: 'Why appointments are longer', body: 'Ten-minute medicine produces more tests, more referrals and more return visits. Twenty minutes costs less overall and is a far better experience.' },
    },
  ],
};