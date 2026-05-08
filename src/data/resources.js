export const RESOURCES = [

  // ── PROBLEM CLARITY ──────────────────────────────────────────────────────────

  { id: 'pc-01', dimension: 'problem_clarity', title: 'The Mom Test', author: 'Rob Fitzpatrick', description: 'The definitive guide to validating your problem without leading the witness. Teaches honest customer conversations that reveal whether your problem is real.', type: 'book', url: 'https://www.momtestbook.com', level_min: 1, level_max: 6, tags: ['customer-discovery', 'validation'] },
  { id: 'pc-02', dimension: 'problem_clarity', title: 'Before the Startup', author: 'Paul Graham · YC', description: 'Get to know your users obsessively before writing code. Reframes how founders think about the problem they\'re solving.', type: 'article', url: 'https://paulgraham.com/before.html', level_min: 1, level_max: 3, tags: ['founders', 'users'] },
  { id: 'pc-03', dimension: 'problem_clarity', title: 'Writing a Business Plan — The Problem', author: 'Sequoia Capital', description: 'Sequoia\'s own framework for articulating purpose, problem, and solution — exactly what investors expect you to nail in the first 60 seconds.', type: 'framework', url: 'https://www.sequoiacap.com/article/writing-a-business-plan/', level_min: 2, level_max: 6, tags: ['framework', 'pitch-structure'] },
  { id: 'pc-04', dimension: 'problem_clarity', title: 'Know Your Customer\'s Jobs to Be Done', author: 'Clayton Christensen · HBR', description: 'The foundational framework for understanding *why* customers hire a product. Forces you to articulate the job your product does — not just what it is.', type: 'article', url: 'https://hbr.org/2016/09/know-your-customers-jobs-to-be-done', level_min: 2, level_max: 6, tags: ['jobs-to-be-done', 'customer-insight'] },

  // ── VALUE PROPOSITION ─────────────────────────────────────────────────────────

  { id: 'vp-01', dimension: 'value_proposition', title: 'Value Proposition Canvas', author: 'Strategyzer', description: 'The canonical framework for mapping customer jobs, pains, and gains to product features. Complete the canvas before your next pitch to sharpen your VP.', type: 'framework', url: 'https://www.strategyzer.com/library/the-value-proposition-canvas', level_min: 1, level_max: 6, tags: ['canvas', 'jobs-to-be-done'] },
  { id: 'vp-02', dimension: 'value_proposition', title: 'Do Things That Don\'t Scale', author: 'Paul Graham · YC', description: 'Why the early value proposition must be hand-crafted, not optimized. Helps founders understand why generic value props fail to convince investors.', type: 'article', url: 'https://paulgraham.com/ds.html', level_min: 1, level_max: 4, tags: ['early-stage', 'value'] },
  { id: 'vp-03', dimension: 'value_proposition', title: 'How to Pitch a Startup', author: 'Andreessen Horowitz', description: 'a16z\'s guide on what makes a value proposition land in a pitch. The section on "why now" is especially useful for connecting VP to timing.', type: 'article', url: 'https://a16z.com/2010/03/23/how-to-pitch-a-startup/', level_min: 2, level_max: 6, tags: ['pitch', 'value-proposition'] },
  { id: 'vp-04', dimension: 'value_proposition', title: 'Positioning: The Battle for Your Mind', author: 'Al Ries & Jack Trout', description: 'The foundational book on carving out a distinct value position in a crowded market. Required reading before articulating why you\'re the only option.', type: 'book', url: 'https://www.amazon.com/Positioning-Battle-Your-Mind-Anniversary/dp/0071373586', level_min: 3, level_max: 6, tags: ['positioning', 'differentiation'] },

  // ── MARKET SIZE ───────────────────────────────────────────────────────────────

  { id: 'ms-01', dimension: 'market_size', title: 'How to Talk About Market Size', author: 'YC Startup School', description: 'YC partners explain what "big enough market" means to a seed investor, with frameworks for bottom-up sizing and the most common mistakes founders make.', type: 'video', url: 'https://www.ycombinator.com/library/6p-how-to-talk-about-market-size', level_min: 1, level_max: 4, tags: ['market', 'sizing'] },
  { id: 'ms-02', dimension: 'market_size', title: 'TAM SAM SOM — How to Size Your Market', author: 'Andreessen Horowitz', description: 'a16z\'s breakdown of TAM/SAM/SOM with real examples. Explains why bottom-up calculations always beat top-down for investor credibility.', type: 'article', url: 'https://a16z.com/market-sizing/', level_min: 1, level_max: 6, tags: ['tam', 'market-sizing'] },
  { id: 'ms-03', dimension: 'market_size', title: 'Startup = Growth', author: 'Paul Graham · YC', description: 'Graham\'s essay arguing that the only thing that matters is operating in a market capable of producing a big company. Reframes how founders justify market size.', type: 'article', url: 'https://paulgraham.com/growth.html', level_min: 3, level_max: 6, tags: ['growth', 'market'] },

  // ── COMPETITORS ───────────────────────────────────────────────────────────────

  { id: 'co-01', dimension: 'competitors', title: 'How to Map Your Competitive Landscape', author: 'First Round Review', description: 'Guide to mapping the competitive landscape without dismissing incumbents. Includes the 2×2 matrix framework investors look for in every pitch deck.', type: 'article', url: 'https://review.firstround.com/how-to-map-out-your-competitive-landscape-without-dismissing-your-competitors', level_min: 1, level_max: 6, tags: ['competition', 'landscape'] },
  { id: 'co-02', dimension: 'competitors', title: 'Zero to One', author: 'Peter Thiel', description: 'Thiel\'s framework for thinking about competition and monopoly. Essential context for why "we have no direct competitors" destroys credibility with investors.', type: 'book', url: 'https://www.amazon.com/Zero-One-Notes-Startups-Future/dp/0804139296', level_min: 2, level_max: 6, tags: ['monopoly', 'competition'] },
  { id: 'co-03', dimension: 'competitors', title: 'How to Answer "Who Are Your Competitors?"', author: 'YC · Dalton Caldwell', description: 'Exactly how investors want competitive slides handled. Covers direct competitors, indirect alternatives, and the status-quo substitute.', type: 'video', url: 'https://www.ycombinator.com/library/6l-common-questions-investors-will-ask', level_min: 1, level_max: 5, tags: ['competitors', 'pitch'] },

  // ── MONETIZATION ──────────────────────────────────────────────────────────────

  { id: 'mo-01', dimension: 'monetization', title: 'The SaaS Business Model & Metrics', author: 'Stripe Atlas', description: 'Breakdown of SaaS, marketplace, transactional, and freemium models with unit economics benchmarks for each.', type: 'article', url: 'https://stripe.com/atlas/guides/business-of-saas', level_min: 1, level_max: 6, tags: ['saas', 'monetization'] },
  { id: 'mo-02', dimension: 'monetization', title: '16 Metrics Every Startup Investor Wants to Know', author: 'Andreessen Horowitz', description: 'a16z\'s explanation of LTV:CAC, churn, payback period, and other metrics investors use to evaluate monetization health.', type: 'article', url: 'https://a16z.com/16-metrics-that-investors-want-to-know/', level_min: 3, level_max: 6, tags: ['unit-economics', 'ltv', 'cac'] },
  { id: 'mo-03', dimension: 'monetization', title: 'Don\'t Under-Price Your SaaS', author: 'Patrick McKenzie · Stripe', description: 'Why SaaS companies should think about pricing and anchoring — and why founders systematically under-price their products.', type: 'blog', url: 'https://www.kalzumeus.com/2011/10/28/dont-call-yourself-a-programmer/', level_min: 2, level_max: 5, tags: ['pricing', 'saas'] },
  { id: 'mo-04', dimension: 'monetization', title: 'The Innovator\'s Dilemma', author: 'Clayton Christensen', description: 'Framework for disrupting incumbents through alternative pricing and business models. Deep context for why unconventional monetization is often the right pitch.', type: 'book', url: 'https://www.amazon.com/Innovators-Dilemma-Revolutionary-Change-Business/dp/0062060244', level_min: 4, level_max: 6, tags: ['disruption', 'business-model'] },

  // ── GO-TO-MARKET ──────────────────────────────────────────────────────────────

  { id: 'gtm-01', dimension: 'go_to_market', title: 'Go-to-Market Fit Framework', author: 'Andreessen Horowitz', description: 'Framework for defining your first 100 customers, distribution channel, and customer acquisition motion — the clearest GTM template for B2B founders.', type: 'framework', url: 'https://a16z.com/go-to-market-fit-framework/', level_min: 1, level_max: 6, tags: ['gtm', 'sales', 'distribution'] },
  { id: 'gtm-02', dimension: 'go_to_market', title: 'Distribution Is the Key to Startup Success', author: 'YC Startup School', description: 'Why distribution beats product in startup success, with examples from Airbnb, Dropbox, and Stripe. Covers channels that actually work at seed stage.', type: 'video', url: 'https://www.ycombinator.com/library/60-channel-talk', level_min: 1, level_max: 4, tags: ['distribution', 'channels'] },
  { id: 'gtm-03', dimension: 'go_to_market', title: 'Traction: Explosive Customer Growth', author: 'Gabriel Weinberg & Justin Mares', description: 'The systematic framework for testing 19 traction channels to find your GTM wedge. Workbook-style approach to identifying your highest-ROI acquisition channel.', type: 'book', url: 'https://www.amazon.com/Traction-Startup-Achieve-Explosive-Customer/dp/1591848369', level_min: 2, level_max: 5, tags: ['traction', 'channels', 'growth'] },
  { id: 'gtm-04', dimension: 'go_to_market', title: 'Crossing the Chasm', author: 'Geoffrey Moore', description: 'The definitive book on transitioning from early adopters to mainstream markets. Essential for founders who know their beachhead but can\'t articulate scale.', type: 'book', url: 'https://www.amazon.com/Crossing-Chasm-3rd-Disruptive-Mainstream/dp/0062292986', level_min: 3, level_max: 6, tags: ['gtm', 'adoption', 'scaling'] },

  // ── DEFENSIBILITY ─────────────────────────────────────────────────────────────

  { id: 'de-01', dimension: 'defensibility', title: 'The Network Effects Bible', author: 'NFX', description: 'Comprehensive guide to the 13 types of network effects. The most cited document on defensibility in Silicon Valley — free, detailed, indispensable.', type: 'framework', url: 'https://www.nfx.com/post/network-effects-bible', level_min: 2, level_max: 6, tags: ['network-effects', 'moats'] },
  { id: 'de-02', dimension: 'defensibility', title: '7 Powers: Foundations of Business Strategy', author: 'Hamilton Helmer', description: 'The most rigorous framework for defensibility in tech: network effects, scale economies, switching costs, counter-positioning, branding, cornered resource, process power.', type: 'book', url: 'https://www.amazon.com/7-Powers-Foundations-Business-Strategy/dp/0998116319', level_min: 4, level_max: 6, tags: ['strategy', 'moats'] },
  { id: 'de-03', dimension: 'defensibility', title: 'Why Moats Matter', author: 'Investopedia', description: 'Structured overview of the five types of economic moats relevant to startup pitches. Useful for articulating long-run competitive advantage clearly.', type: 'article', url: 'https://www.investopedia.com/terms/e/economicmoat.asp', level_min: 1, level_max: 4, tags: ['moats', 'competitive-advantage'] },

  // ── FOUNDER CREDIBILITY ───────────────────────────────────────────────────────

  { id: 'fc-01', dimension: 'founder_credibility', title: 'How to Evaluate Startup Ideas', author: 'YC Startup School', description: 'YC partners on how investors evaluate founder-market fit in the first 5 minutes. Covers domain authority signals and why your background story matters.', type: 'video', url: 'https://www.ycombinator.com/library/6m-how-to-evaluate-startup-ideas', level_min: 1, level_max: 5, tags: ['credibility', 'founder-market-fit'] },
  { id: 'fc-02', dimension: 'founder_credibility', title: 'What I Look For in a Founder', author: 'Marc Andreessen · a16z', description: 'The qualities investors look for and how founders can signal them in a short conversation or pitch.', type: 'article', url: 'https://a16z.com/2010/04/17/what-i-look-for-in-a-founder/', level_min: 2, level_max: 6, tags: ['founder', 'credibility'] },
  { id: 'fc-03', dimension: 'founder_credibility', title: 'Tell Me the Story of Your Startup', author: 'First Round Review', description: 'How to structure your personal origin story so it signals why you specifically are the right person to solve this problem right now.', type: 'article', url: 'https://review.firstround.com/tell-me-the-story-of-your-startup', level_min: 1, level_max: 4, tags: ['storytelling', 'origin-story'] },
  { id: 'fc-04', dimension: 'founder_credibility', title: 'The Hard Thing About Hard Things', author: 'Ben Horowitz · a16z', description: 'Investors read founders through the lens of "will this person hold together when things go sideways?" — this book gives you that language.', type: 'book', url: 'https://www.amazon.com/Hard-Thing-About-Things-Building/dp/0062273205', level_min: 4, level_max: 6, tags: ['leadership', 'resilience'] },
];

export function getResourcesForDimensions(dimensions = [], level = 1) {
  return RESOURCES.filter(
    r => dimensions.includes(r.dimension) && level >= r.level_min && level <= r.level_max
  );
}

export function getWeakestDimensions(scores = {}, n = 3) {
  return Object.entries(scores)
    .filter(([, v]) => typeof v === 'number')
    .sort((a, b) => a[1] - b[1])
    .slice(0, n)
    .map(([key]) => key);
}
