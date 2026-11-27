/* ================= LIVE PREVIEW (inside the studio's floating window) =================
   The studio opens this same site in a frame at ?dpreview=1. Here the site does not load anything
   from Supabase: the studio sends its draft by postMessage (same origin only) and the frame renders it,
   keeping the scroll position between updates. Links inside the frame still move between pages of the draft. */
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Store, normalize } from './store';
import { Site, renderSite, openModal } from './site';

export const isEmbed = () => { try { return new URLSearchParams(location.search).has('dpreview') && window.parent !== window; } catch { return false; } };

export function bootEmbed() {
  document.documentElement.classList.add('dpreview');
  const ld = document.getElementById('loader'); if (ld) ld.remove();
  Store.live = normalize(null); Site.preview = true;
  const page = () => { const id = (location.hash || '').slice(1); return id === 'admin' ? '' : id; };
  const draw = (keep) => {
    if (!Store.draft) return;
    const y = scrollY;
    renderSite(Store.draft, page());
    if (keep && y) requestAnimationFrame(() => requestAnimationFrame(() => { scrollTo(0, y); try { ScrollTrigger.refresh(); } catch { /* not ready */ } }));
  };
  const toSection = (id) => requestAnimationFrame(() => requestAnimationFrame(() => {
    const el = document.getElementById('sec-' + id); if (el) el.scrollIntoView({ block: 'start' });
  }));
  addEventListener('hashchange', () => { if ((location.hash || '').slice(1) === 'admin') { history.replaceState(null, '', '#'); } draw(false); });
  addEventListener('message', (e) => {
    if (e.origin !== location.origin || e.source !== window.parent) return;
    const d = e.data; if (!d || d.type !== 'dorma:preview') return;
    if (d.cfg) Store.draft = normalize(d.cfg);
    const go = d.go || null;
    if (go && go.page != null && go.page !== page()) { history.replaceState(null, '', '#' + go.page); draw(false); }
    else if (d.cfg || d.redraw) draw(true);
    if (go && go.sec) toSection(go.sec);
    if (go && go.modal && Site.cfg) { try { openModal(Site.cfg, go.modal); } catch { /* modal not found */ } }
  });
  window.parent.postMessage({ type: 'dorma:ready' }, location.origin);
}
