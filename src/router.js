// Lightweight client-side router. Three routes:
//   /                 -> home (the persistent #app layer)
//   /template/:slug   -> full-screen template preview
//   /demo/:name       -> full-screen demo preview
// Navigation is driven by [data-route] attributes (carousel Explore buttons + back button),
// intercepted via a single delegated click handler, plus History API push/pop.

import { openPreview, closePreview, previewOpen } from './transitions.js';
import { templateView, demoView } from './manifest.js';

function parse(pathname) {
  let m = pathname.match(/^\/template\/([^/]+)\/?$/);
  if (m) return { type: 'template', name: decodeURIComponent(m[1]) };
  m = pathname.match(/^\/demo\/([^/]+)\/?$/);
  if (m) return { type: 'demo', name: decodeURIComponent(m[1]) };
  return null; // home
}

function viewFor(route) {
  return route.type === 'template' ? templateView(route.name) : demoView(route.name);
}

// Reconcile the rendered layer with the requested route.
async function apply(route, animate) {
  if (route) {
    const view = viewFor(route);
    if (view && view.url) {
      // view.title carries the template/demo name from the MANIFEST — it's the text
      // the kinetic transition explodes. openPreview is interruptible, so it handles
      // being called while another transition is still in flight.
      await openPreview(view, animate);
      return;
    }
    // Unknown slug/name -> fall through to home.
  }
  if (previewOpen()) await closePreview(animate);
}

export function navigate(path) {
  if (path === window.location.pathname) return;
  window.history.pushState({}, '', path);
  apply(parse(path), true);
}

export function startRouter() {
  history.scrollRestoration = 'manual';

  // Back/forward — reconcile without pushing a new entry.
  window.addEventListener('popstate', () => apply(parse(window.location.pathname), true));

  // Delegated link interception for every [data-route] (carousel cards + back button).
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-route]');
    if (!link) return;
    const path = link.getAttribute('data-route');
    if (path == null) return;
    e.preventDefault();
    navigate(path);
  });

  // Initial deep link — open the matching preview instantly over the mounted home.
  const route = parse(window.location.pathname);
  if (route) apply(route, false);
}
