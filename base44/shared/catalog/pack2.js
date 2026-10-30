// Local service + Restaurant template archetypes.

export const localService = {
  category: 'local_service',
  accents: ['#0369a1', '#b45309', '#166534', '#9a3412', '#1e3a8a', '#4d7c0f'],
  images: [
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=80',
  ],
  names: [
    'Harbor Trade', 'Northline Coatings', 'Cedar and Stone', 'Trueflow Plumbing', 'Ridgeline Roofing', 'Copperline Electric', 'Stonebridge Landscape', 'Clearwater Pools',
    'Ironhill Garage', 'Maple Street HVAC', 'Bayside Remodel', 'Granite Works', 'Summit Tree Care', 'Lakeshore Moving', 'Bright Hearth', 'Tin Roof Exteriors',
    'Valley Handyman', 'Westgate Locksmith',
  ],
  plans: [
    { name: 'Diagnostic', price: '$89', period: 'one visit', cta: 'Book a visit', features: ['Full inspection', 'Written findings', 'Credited to the repair'] },
    { name: 'Standard job', price: 'Quoted', period: 'per project', cta: 'Request a quote', features: ['Fixed written price', 'Licensed crew', 'Two-year workmanship cover'] },
    { name: 'Care plan', price: '$39', period: 'per month', cta: 'Join the plan', features: ['Seasonal checks', 'Priority scheduling', '10% off parts'] },
  ],
  archetypes: [
    {
      eyebrow: 'Exterior coatings',
      title: 'A finish that still looks right in year five',
      sub: 'Surface prep, coating and warranty work done by a crew that has been on this street before.',
      stats: [['16', 'years serving the county'], ['1,400+', 'homes coated'], ['5-year', 'workmanship warranty']],
      features: [
        ['Prep is the job', 'Washing, scraping and priming are quoted as separate line items, never hidden.'],
        ['Written fixed price', 'The number you approve is the number you pay, unless you add work in writing.'],
        ['Crews, not subcontractors', 'The people on your house are on our payroll and trained on our method.'],
        ['Walkthrough before payment', 'We finish the punch list with you standing there, then invoice.'],
      ],
      showcase: {
        title: 'What the prep stage looks like',
        body: 'Most coating failures are moisture and adhesion problems. We document both before a single gallon is opened.',
        bullets: ['Moisture readings recorded per elevation', 'Photographs at each stage', 'Warranty registered in your name'],
      },
      faq: [
        ['How long does a house take?', 'A typical single-family exterior takes four to six working days, weather permitting.'],
        ['Is there a deposit?', 'A materials deposit holds the date; the balance is due after the walkthrough.'],
        ['Do you work in winter?', 'Yes, with cold-weather products rated for the temperature on the day.'],
      ],
      cta: { title: 'Get a written quote this week', body: 'Send your address and we will schedule a half-hour assessment.', cta: 'Request a quote' },
      text: { title: 'Why our quotes are itemised', body: 'A single lump sum hides the difference between a proper prep job and a pressure wash. Line items let you compare like for like, which is the only way a quote is useful.' },
    },
    {
      eyebrow: 'Plumbing and heating',
      title: 'Someone answers, and then actually comes',
      sub: 'Licensed plumbing and heating for homes and small commercial sites, with arrival windows you can plan around.',
      stats: [['24/7', 'emergency line answered by staff'], ['90 min', 'average emergency arrival'], ['38', 'licensed technicians']],
      features: [
        ['A real arrival window', 'Two-hour windows, plus a text when the van is ten minutes out.'],
        ['Price agreed on site', 'The technician explains the options and gets approval before starting.'],
        ['Parts on the van', 'Common failures are stocked, so most visits finish the same day.'],
        ['Work photographed', 'Before and after images go on the invoice so the record is complete.'],
      ],
      showcase: {
        title: 'No call centre between you and the tech',
        body: 'Dispatch and the technicians share the same schedule, so an update is a real answer.',
        bullets: ['Licensed and insured in writing', 'Flat-rate pricing on standard work', 'Follow-up call after every repair'],
      },
      faq: [
        ['Do you charge for travel?', 'No travel charge inside the service area, which covers the whole county.'],
        ['Can you quote from a photo?', 'Yes for replacements and fixtures, with a site check before the final price.'],
        ['Is emergency work more expensive?', 'There is an after-hours rate and it is quoted before we dispatch.'],
      ],
      cta: { title: 'Describe the problem and get a slot', body: 'Photos help us bring the right parts on the first visit.', cta: 'Book a visit' },
      text: { title: 'Flat rates, explained', body: 'Hourly billing rewards slow work. Our standard repairs are priced by task, so the invoice matches the quote whether the job takes forty minutes or two hours.' },
    },
    {
      eyebrow: 'Home remodelling',
      title: 'A renovation with a schedule you can trust',
      sub: 'Kitchens, baths and additions run by one project lead, with the timeline published before demolition.',
      stats: [['92%', 'projects finished on the agreed date'], ['1', 'named lead per project'], ['3', 'weeks average design phase']],
      features: [
        ['Published schedule', 'Every phase with its dates, shared digitally and updated weekly.'],
        ['One number to call', 'Your project lead answers, not a rotating office line.'],
        ['Allowances in writing', 'Tile, fixtures and cabinetry budgets stated before selections begin.'],
        ['Site kept habitable', 'Dust barriers, daily clean-down and a plan for your kitchen while it is gone.'],
      ],
      showcase: {
        title: 'Selections before demolition',
        body: 'The most common delay is a decision made too late. We close every choice before the first wall opens.',
        bullets: ['Selection checklist with deadlines', 'Change orders priced within 48 hours', 'Weekly photo update on Fridays'],
      },
      faq: [
        ['What size projects do you take?', 'From a single bathroom to full-floor remodels, typically $40k and up.'],
        ['Can we live in the house?', 'Usually yes for kitchens and baths; additions vary and we plan it upfront.'],
        ['Who handles permits?', 'We pull and manage permits, and inspections are on the schedule.'],
      ],
      cta: { title: 'Start with a design conversation', body: 'Bring photos of the space and a rough budget range.', cta: 'Book a consultation' },
      text: { title: 'How we keep the date', body: 'The schedule is built backwards from your move-in date, with float placed on the phases that historically slip. When a supplier runs late, you hear it the same day with a revised plan.' },
    },
  ],
};

export const restaurant = {
  category: 'restaurant',
  accents: ['#7c2d12', '#166534', '#1f2937', '#9f1239', '#a16207', '#0f766e'],
  images: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
  ],
  names: [
    'The Salt Room', 'Ember and Oak', 'Cardamom House', 'Marigold Kitchen', 'Bramble', 'Casa Lumen', 'Copper Pot', 'Fig and Fennel',
    'Harbour Table', 'Juniper Room', 'Little Sparrow', 'Nightingale', 'Olive Grove', 'Rye and Rose', 'Sable', 'Tandem',
    'Wild Thyme', 'Yuzu Counter',
  ],
  plans: [
    { name: 'Lunch prix fixe', price: '$32', period: 'two courses', cta: 'Reserve lunch', features: ['Seasonal menu', 'Vegetarian option', 'Seatings from 11:30'] },
    { name: 'Tasting menu', price: '$95', period: 'per guest', cta: 'Reserve dinner', features: ['Six courses', 'Optional wine pairing', 'Dietary notes welcomed'] },
    { name: 'Private dining', price: 'From $1,200', period: 'per room', cta: 'Enquire', features: ['Up to 18 guests', 'Set or bespoke menu', 'Dedicated service'] },
  ],
  archetypes: [
    {
      eyebrow: 'Neighbourhood dining',
      title: 'Cooked over fire, served without ceremony',
      sub: 'A short menu that changes with the market, a wood oven, and a room built for long conversations.',
      stats: [['7', 'years on the same corner'], ['18', 'seats at the counter'], ['Daily', 'menu written each morning']],
      features: [
        ['A menu that follows the market', 'Six starters, four mains and whatever the growers brought that morning.'],
        ['Fire as the only heat source', 'One oven, one grill, and a kitchen small enough to keep standards honest.'],
        ['Wine chosen by the glass', 'Forty bottles open every night, all available by the glass or half.'],
        ['Counter seats for walk-ins', 'A third of the room is kept unreserved for people who decide late.'],
      ],
      showcase: {
        title: 'The room behind the menu',
        body: 'Bare oak, low light and a kitchen you can watch. Nothing in the room competes with the plate.',
        bullets: ['Seasonal produce from three named farms', 'Vegetarian and gluten-free by default', 'Corkage offered on Sundays'],
      },
      faq: [
        ['How far ahead do bookings open?', 'Thirty days ahead at nine in the morning, with the counter held for walk-ins.'],
        ['Can you handle dietaries?', 'Yes, with notice. Tell us at booking and the kitchen writes around it.'],
        ['Is there a dress code?', 'None. It is a neighbourhood room.'],
      ],
      cta: { title: 'Book a table for this week', body: 'Dinner seatings run from 17:30, lunch from 11:30 Tuesday to Saturday.', cta: 'Reserve a table' },
      text: { title: 'Why the menu is short', body: 'A small menu means every dish is cooked hundreds of times a month, the produce turns over fresh, and nothing sits in a fridge waiting for its one order.' },
    },
    {
      eyebrow: 'Modern bistro',
      title: 'Classic technique, lighter on the plate',
      sub: 'French foundations with a coastal pantry: butter where it counts, acid where it wakes things up.',
      stats: [['4.9', 'average guest rating'], ['Two', 'AA rosettes'], ['9', 'course tasting option']],
      features: [
        ['Sauces made to order', 'Stocks reduced daily and finished à la minute, never held overnight.'],
        ['A coastal larder', 'Day-boat fish and shellfish from two suppliers who text the catch.'],
        ['Bread baked here', 'Sourdough and butter made in-house every morning before service.'],
        ['Wine with a point of view', 'Old-world bottles, low-intervention growers, and honest advice.'],
      ],
      showcase: {
        title: 'Service that reads the table',
        body: 'Some guests want a two-hour dinner, some want to be out in fifty minutes. We ask.',
        bullets: ['Theatre and pre-show menus', 'Allergy notes carried to the pass', 'A quiet corner reserved nightly'],
      },
      faq: [
        ['Do you take large parties?', 'Up to eight in the main room, larger groups in the private room above.'],
        ['Is there a vegetarian tasting?', 'Yes, a full nine-course vegetarian menu written each week.'],
        ['Can we buy a gift voucher?', 'Any value, posted or collected, valid for twelve months.'],
      ],
      cta: { title: 'Reserve the corner table', body: 'Two seatings nightly, with the last order at 21:45.', cta: 'Reserve now' },
      text: { title: 'On cooking with restraint', body: 'The discipline is in what stays off the plate. Three elements, seasoned properly, will beat eight arranged for a photograph.' },
    },
    {
      eyebrow: 'All-day cafe',
      title: 'Coffee worth the walk, food worth staying for',
      sub: 'Breakfast through early dinner, with a pastry counter, a proper kitchen and no rush to leave.',
      stats: [['6am', 'first espresso pulled'], ['2', 'roasts on the grinder daily'], ['All day', 'kitchen until 16:00']],
      features: [
        ['A rotating single origin', 'One guest filter coffee each week, chosen by the baristas who serve it.'],
        ['Pastry baked at four', 'Croissants and a daily loaf out of the oven before the doors open.'],
        ['Lunch that is not an afterthought', 'A short hot menu with two salads that change with the season.'],
        ['Room to work', 'Wide tables, sockets at every seat, and no time limit off-peak.'],
      ],
      showcase: {
        title: 'The counter is the heart of it',
        body: 'Order at the bar, watch it made, sit wherever you like. Table service arrives at eleven.',
        bullets: ['Beans roasted locally each Tuesday', 'Oat, soy and whole milk standard', 'Takeaway cups that actually compost'],
      },
      faq: [
        ['Do you take reservations?', 'Not for tables under six; the room is first come, first served.'],
        ['Is there wifi?', 'Yes, and it is fast enough for calls outside the 12:00 to 14:00 rush.'],
        ['Can I buy beans?', 'Retail bags of both grinder coffees are on the shelf by the till.'],
      ],
      cta: { title: 'Come in before the rush', body: 'The quietest hour is 8:30 to 10:00 on weekdays.', cta: 'See the menu' },
      text: { title: 'A cafe is a daily habit', body: 'People come four times a week, so consistency matters more than novelty. The coffee is dialled in twice a day and the staff know the regulars by order.' },
    },
  ],
};