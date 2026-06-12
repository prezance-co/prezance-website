// Single source of truth for the template gallery + route resolution.
// Each entry: label · category · path (real on-disk index.html) · gradient (a → b)
// · thumb (optional 800×500 screenshot used as the card face; gradient is the fallback).

export const MANIFEST = [
  { label: 'Clinical Authority', category: 'medical',    path: 'templates/novena/theme/index.html',    a: '#0b1f3a', b: '#1a4a7a', thumb: 'templates/novena/thumb.jpg' },
  { label: 'Warm & Elegant',     category: 'medical',    path: 'templates/medic/index.html',           a: '#2a1810', b: '#7a4a2a', thumb: 'templates/medic/thumb.jpg' },
  { label: 'Modern Minimal',     category: 'medical',    path: 'templates/medilab/index.html',         a: '#0a1a18', b: '#1a6a5a', thumb: 'templates/medilab/thumb.jpg' },
  { label: 'Dark Premium',       category: 'medical',    path: 'templates/medicio/index.html',         a: '#141420', b: '#3a3450', thumb: 'templates/medicio/thumb.jpg' },
  { label: 'Soft & Caring',      category: 'medical',    path: 'templates/klinik/index.html',          a: '#122a2e', b: '#2a7a78', thumb: 'templates/klinik/thumb.jpg' },
  { label: 'Steak House',        category: 'restaurant', path: 'templates/steakhouse/index.html',      a: '#2a1410', b: '#6a2a1a', thumb: 'templates/steakhouse/thumb.jpg' },
  { label: 'Bistro Elegance',    category: 'restaurant', path: 'templates/bistro/index.html',          a: '#201810', b: '#5a4030', thumb: 'templates/bistro/thumb.jpg' },
  { label: 'Barista Cafe',       category: 'restaurant', path: 'templates/barista/index.html',         a: '#2a1c10', b: '#6a4424', thumb: 'templates/barista/thumb.jpg' },
  { label: 'Law',                category: 'law',        path: 'templates/law/index.html',             a: '#0c1424', b: '#25324f', thumb: 'templates/law/thumb.jpg' },
  { label: 'Lawyer',             category: 'law',        path: 'templates/lawyer/index.html',          a: '#1a1a22', b: '#3a3a5a', thumb: 'templates/lawyer/thumb.jpg' },
  { label: 'Law Firm',           category: 'law',        path: 'templates/lawfirm/index.html',         a: '#10131c', b: '#2c3550', thumb: 'templates/lawfirm/thumb.jpg' },
  { label: 'Waso Strategy',      category: 'business',   path: 'templates/waso/index.html',            a: '#0c1830', b: '#1e4a7a', thumb: 'templates/waso/thumb.jpg' },
  { label: 'Tween Agency',       category: 'business',   path: 'templates/tween/index.html',           a: '#1a1030', b: '#4a2a7a', thumb: 'templates/tween/thumb.jpg' },
  { label: 'Pocketo Dark',       category: 'saas',       path: 'templates/app-1/index.html',           a: '#0d2818', b: '#1a7a40', thumb: 'templates/app-1/thumb.jpg' },
  { label: 'Pocketo Warm',       category: 'saas',       path: 'templates/app-2/index.html',           a: '#2a1408', b: '#7a3210', thumb: 'templates/app-2/thumb.jpg' },
  { label: 'FlowSync Navy',      category: 'saas',       path: 'templates/saas-verdana/index.html',    a: '#0c1424', b: '#1e3a5a', thumb: 'templates/saas-verdana/thumb.jpg' },
  { label: 'FlowSync Bold',      category: 'saas',       path: 'templates/saas-rawblock/index.html',   a: '#0a0a0a', b: '#2e2e2e', thumb: 'templates/saas-rawblock/thumb.jpg' }
];

export const CAT_LABEL = { medical: 'Medical', restaurant: 'Restaurant', law: 'Law', business: 'Business', saas: 'SaaS & Apps' };

// Slug derived from the path's first directory: 'templates/novena/theme/index.html' -> 'novena'.
export const slugFor = (entry) => entry.path.split('/')[1];

// Where a carousel card links: SaaS cards open the FlowSync demo, everything else opens its template.
export const routeFor = (entry) =>
  entry.category === 'saas' ? '/demo/saas' : `/template/${slugFor(entry)}`;

// Resolve a /template/:slug route to the real iframe URL (handles novena's theme/ nesting).
export function templateView(slug) {
  const e = MANIFEST.find((t) => slugFor(t) === slug);
  return e ? { url: '/' + e.path, title: e.label } : null;
}

// Friendly titles for the three demos.
const DEMO_TITLES = { saas: 'FlowSync', clinic: 'Clinic', restaurant: 'Sama' };

// Resolve a /demo/:name route to the real iframe URL.
export function demoView(name) {
  return { url: `/demos/${name}/index.html`, title: DEMO_TITLES[name] || name };
}
