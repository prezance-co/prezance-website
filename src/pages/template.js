// Full-screen preview layer — a back button + an <iframe> of a template or demo.
// Used for both /template/:slug and /demo/:name (both are just full-screen iframe + back).

const esc = (s) =>
  String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function createPreview(view) {
  const el = document.createElement('div');
  el.className = 'preview-layer';
  el.setAttribute('data-layer', 'preview');
  el.innerHTML = `
    <div class="preview-bar">
      <button class="preview-back" type="button" data-route="/" aria-label="Back to Prezance">← Back</button>
      <span class="preview-title">${esc(view.title)}</span>
    </div>
    <iframe class="preview-frame" src="${esc(view.url)}" title="${esc(view.title || 'Preview')}" loading="lazy"></iframe>
  `;
  return el;
}
